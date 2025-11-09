// components/dashboard/InfosKind.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function InfosKind() {
  const [adminCode, setAdminCode] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // States for first form (Ajouter élève)
  const [nomEleve, setNomEleve] = useState('');
  const [prenomEleve, setPrenomEleve] = useState('');
  const [sexeEleve, setSexeEleve] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [classe, setClasse] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cinResponsable, setCinResponsable] = useState('');
  const [nomResponsable, setNomResponsable] = useState('');
  const [prenomResponsable, setPrenomResponsable] = useState('');
  const [telResponsable, setTelResponsable] = useState('');
  const [cinEnseignant, setCinEnseignant] = useState('');
  const [nomEnseignant, setNomEnseignant] = useState('');
  const [prenomEnseignant, setPrenomEnseignant] = useState('');
  const [isSubmittingEleve, setIsSubmittingEleve] = useState(false);
  const [messageEleve, setMessageEleve] = useState('');

  // States for second form (Infos école)
  const [anneeAcademique, setAnneeAcademique] = useState('');
  const [ecole, setEcole] = useState('');
  const [directeur, setDirecteur] = useState('');
  const [telephone, setTelephone] = useState('');
  const [zone, setZone] = useState('');
  const [inspecteurZone, setInspecteurZone] = useState('');
  const [isSubmittingEcole, setIsSubmittingEcole] = useState(false);
  const [messageEcole, setMessageEcole] = useState('');
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  // States for Élèves section
  const [eleves, setEleves] = useState<{ id: number; nom: string; prenom: string }[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedEleve, setSelectedEleve] = useState<any>(null);
  const [editingEleve, setEditingEleve] = useState<any>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCode }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminToken(data.token);
        setIsLoggedIn(true);
        fetchEleves();
        fetchSchoolInfo();
      } else {
        alert(data.message || 'Code invalide');
      }
    } catch {
      alert('Erreur lors de la connexion admin');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchEleves();
      fetchSchoolInfo();
    }
  }, [isLoggedIn]);

  const fetchEleves = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/eleves-kind`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      setEleves(data);
    } catch {
      alert('Erreur lors du chargement des élèves');
    }
  };

  const fetchSchoolInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/infos-ecole-kind`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.id) {
        setSchoolInfo(data);
        setAnneeAcademique(data.annee_academique || '');
        setEcole(data.ecole || '');
        setDirecteur(data.directeur || '');
        setTelephone(data.telephone || '');
        setZone(data.zone || '');
        setInspecteurZone(data.inspecteur_zone || '');
      }
    } catch {
      // No data yet, remains empty
    }
  };

  const fetchSelectedEleve = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/eleve-kind/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.id) {
        setSelectedEleve(data);
        setEditingEleve(data);
      }
    } catch {
      alert('Erreur lors du chargement de l\'élève');
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchSelectedEleve(parseInt(selectedId));
    } else {
      setSelectedEleve(null);
      setEditingEleve({});
    }
  }, [selectedId]);

  const handleSubmitEleve = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEleve(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/add-eleve-kind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          nom: nomEleve,
          prenom: prenomEleve,
          sexe: sexeEleve,
          date_naissance: dateNaissance,
          lieu_naissance: lieuNaissance,
          classe,
          adresse,
          personne_responsable_cin: cinResponsable,
          nom_responsable: nomResponsable,
          prenom_responsable: prenomResponsable,
          tel_responsable: telResponsable,
          enseignant_cin: cinEnseignant,
          nom_enseignant: nomEnseignant,
          prenom_enseignant: prenomEnseignant,
        }),
      });
      const data = await res.json();
      setMessageEleve(data.success ? 'Élève ajouté avec succès' : data.message);
      if (data.success) {
        setNomEleve('');
        setPrenomEleve('');
        setSexeEleve('');
        setDateNaissance('');
        setLieuNaissance('');
        setClasse('');
        setAdresse('');
        setCinResponsable('');
        setNomResponsable('');
        setPrenomResponsable('');
        setTelResponsable('');
        setCinEnseignant('');
        setNomEnseignant('');
        setPrenomEnseignant('');
        fetchEleves();
      }
    } catch {
      setMessageEleve('Erreur lors de l\'ajout');
    } finally {
      setIsSubmittingEleve(false);
    }
  };

  const handleSubmitEcole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEcole(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update-infos-ecole-kind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          annee_academique: anneeAcademique,
          ecole,
          directeur,
          telephone,
          zone,
          inspecteur_zone: inspecteurZone,
        }),
      });
      const data = await res.json();
      setMessageEcole(data.success ? 'Infos école mises à jour' : data.message);
      fetchSchoolInfo();
    } catch {
      setMessageEcole('Erreur lors de la mise à jour');
    } finally {
      setIsSubmittingEcole(false);
    }
  };

  const updateFieldEleve = async (field: string, value: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update-field-eleve-kind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id: selectedId, field, value }),
      });
      if (!res.ok) alert('Erreur lors de la mise à jour');
      setEditingEleve((prev: any) => ({ ...prev, [field]: value }));
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteEleve = async (id: string) => {
    if (!window.confirm('Confirmer la suppression de l\'élève ?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/eleve-kind/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setEleves((prev) => prev.filter((e) => e.id.toString() !== id));
        setSelectedId('');
        setSelectedEleve(null);
        setEditingEleve({});
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6 text-center">Accès Administrateur Kindergarten</h2>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Code administrateur"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <button type="submit" disabled={isLoggingIn} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center">
            {isLoggingIn ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Entrer'
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-8">
      <h1 className="text-3xl font-bold text-center">Informations Kindergarten</h1>

      {/* Premier formulaire : Ajouter élève */}
      <section className="bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Ajouter un élève</h2>
        <form onSubmit={handleSubmitEleve} className="space-y-4">
          <input type="text" placeholder="Nom de l'élève" value={nomEleve} onChange={(e) => setNomEleve(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Prénom de l'élève" value={prenomEleve} onChange={(e) => setPrenomEleve(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Sexe de l'élève" value={sexeEleve} onChange={(e) => setSexeEleve(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Date de naissance de l’élève" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Lieu de naissance" value={lieuNaissance} onChange={(e) => setLieuNaissance(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Classe" value={classe} onChange={(e) => setClasse(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Personne responsable CIN/NIF" value={cinResponsable} onChange={(e) => setCinResponsable(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Nom de la personne responsable" value={nomResponsable} onChange={(e) => setNomResponsable(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Prénom de la personne responsable" value={prenomResponsable} onChange={(e) => setPrenomResponsable(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Téléphone de la personne responsable" value={telResponsable} onChange={(e) => setTelResponsable(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Enseignant CIN/NIF" value={cinEnseignant} onChange={(e) => setCinEnseignant(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Nom de l'enseignant" value={nomEnseignant} onChange={(e) => setNomEnseignant(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Prénom de l'enseignant" value={prenomEnseignant} onChange={(e) => setPrenomEnseignant(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <button type="submit" disabled={isSubmittingEleve} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center">
            {isSubmittingEleve ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Ajouter l\'élève'
            )}
          </button>
          {messageEleve && <p className="text-center">{messageEleve}</p>}
        </form>
      </section>

      {/* Deuxième formulaire : Infos école */}
      <section className="bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Informations École</h2>
        <form onSubmit={handleSubmitEcole} className="space-y-4">
          <input type="text" placeholder="Année académique" value={anneeAcademique} onChange={(e) => setAnneeAcademique(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="École" value={ecole} onChange={(e) => setEcole(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Directeur(rice)" value={directeur} onChange={(e) => setDirecteur(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Zone" value={zone} onChange={(e) => setZone(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Inspecteur de zone" value={inspecteurZone} onChange={(e) => setInspecteurZone(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <button type="submit" disabled={isSubmittingEcole} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center">
            {isSubmittingEcole ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Mettre à jour'
            )}
          </button>
          {messageEcole && <p className="text-center">{messageEcole}</p>}
        </form>
      </section>

      {/* Section Élèves */}
      <section className="bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Élèves</h2>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        >
          <option value="">Sélectionnez un élève</option>
          {eleves
            .sort((a, b) => {
              const nameA = `${a.prenom} ${a.nom}`.toLowerCase();
              const nameB = `${b.prenom} ${b.nom}`.toLowerCase();
              return nameA.localeCompare(nameB);
            })
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
              </option>
            ))}
        </select>
        {selectedEleve && (
          <div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom de l'élève"
                value={editingEleve.nom || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, nom: e.target.value }))}
                onBlur={() => updateFieldEleve('nom', editingEleve.nom)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Prénom de l'élève"
                value={editingEleve.prenom || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, prenom: e.target.value }))}
                onBlur={() => updateFieldEleve('prenom', editingEleve.prenom)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Sexe de l'élève"
                value={editingEleve.sexe || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, sexe: e.target.value }))}
                onBlur={() => updateFieldEleve('sexe', editingEleve.sexe)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Date de naissance de l’élève"
                value={editingEleve.date_naissance || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, date_naissance: e.target.value }))}
                onBlur={() => updateFieldEleve('date_naissance', editingEleve.date_naissance)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Lieu de naissance"
                value={editingEleve.lieu_naissance || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, lieu_naissance: e.target.value }))}
                onBlur={() => updateFieldEleve('lieu_naissance', editingEleve.lieu_naissance)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Classe"
                value={editingEleve.classe || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, classe: e.target.value }))}
                onBlur={() => updateFieldEleve('classe', editingEleve.classe)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Adresse"
                value={editingEleve.adresse || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, adresse: e.target.value }))}
                onBlur={() => updateFieldEleve('adresse', editingEleve.adresse)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Personne responsable CIN/NIF"
                value={editingEleve.personne_responsable_cin || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, personne_responsable_cin: e.target.value }))}
                onBlur={() => updateFieldEleve('personne_responsable_cin', editingEleve.personne_responsable_cin)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Nom de la personne responsable"
                value={editingEleve.nom_responsable || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, nom_responsable: e.target.value }))}
                onBlur={() => updateFieldEleve('nom_responsable', editingEleve.nom_responsable)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Prénom de la personne responsable"
                value={editingEleve.prenom_responsable || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, prenom_responsable: e.target.value }))}
                onBlur={() => updateFieldEleve('prenom_responsable', editingEleve.prenom_responsable)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Téléphone de la personne responsable"
                value={editingEleve.tel_responsable || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, tel_responsable: e.target.value }))}
                onBlur={() => updateFieldEleve('tel_responsable', editingEleve.tel_responsable)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Enseignant CIN/NIF"
                value={editingEleve.enseignant_cin || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, enseignant_cin: e.target.value }))}
                onBlur={() => updateFieldEleve('enseignant_cin', editingEleve.enseignant_cin)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Nom de l'enseignant"
                value={editingEleve.nom_enseignant || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, nom_enseignant: e.target.value }))}
                onBlur={() => updateFieldEleve('nom_enseignant', editingEleve.nom_enseignant)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Prénom de l'enseignant"
                value={editingEleve.prenom_enseignant || ''}
                onChange={(e) => setEditingEleve((prev: any) => ({ ...prev, prenom_enseignant: e.target.value }))}
                onBlur={() => updateFieldEleve('prenom_enseignant', editingEleve.prenom_enseignant)}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div className="mt-6 flex space-x-4 justify-center">
              <button onClick={() => handleDeleteEleve(selectedId)} disabled={isDeleting} className="bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Supprimer l\'élève'
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
  }
