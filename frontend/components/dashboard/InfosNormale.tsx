// components/dashboard/InfosNormale.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
} from 'docx';

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function InfosNormale() {
  const [adminCode, setAdminCode] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // States for first form (Ajouter étudiante)
  const [classeActuelle, setClasseActuelle] = useState('');
  const [anneeAcademique, setAnneeAcademique] = useState('');
  const [codeEtudiante, setCodeEtudiante] = useState('');
  const [nomEtudiante, setNomEtudiante] = useState('');
  const [prenomEtudiante, setPrenomEtudiante] = useState('');
  const [option, setOption] = useState('');
  const [sexeEtudiante, setSexeEtudiante] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [commune, setCommune] = useState('');
  const [nomDerniereEcole, setNomDerniereEcole] = useState('');
  const [districtDerniereEcole, setDistrictDerniereEcole] = useState('');
  const [derniereClasse, setDerniereClasse] = useState('');
  const [anneeDerniereEcole, setAnneeDerniereEcole] = useState('');
  const [mentionDerniereEcole, setMentionDerniereEcole] = useState('');
  const [isSubmittingEtudiante, setIsSubmittingEtudiante] = useState(false);
  const [messageEtudiante, setMessageEtudiante] = useState('');

  // States for Étudiantes section
  const [etudiantes, setEtudiantes] = useState<{ id: number; nom: string; prenom: string }[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedEtudiante, setSelectedEtudiante] = useState<any>(null);
  const [editingEtudiante, setEditingEtudiante] = useState<any>({});
  const [isDeleting, setIsDeleting] = useState(false);

  // New state for all étudiantes details (for Word generation)
  const [allEtudiantes, setAllEtudiantes] = useState<any[]>([]);

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
      fetchEtudiantes();
      fetchAllEtudiantes(); // New: Fetch all details for Word
    }
  }, [isLoggedIn]);

  const fetchEtudiantes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/etudiantes-normale`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEtudiantes(Array.isArray(data) ? data : []);
    } catch {
      alert('Erreur lors du chargement des étudiantes');
      setEtudiantes([]);
    }
  };

  // New: Fetch all étudiantes with full details
  const fetchAllEtudiantes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/all-etudiantes-normale`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAllEtudiantes(Array.isArray(data) ? data : []);
    } catch {
      console.error('Erreur lors du chargement de toutes les étudiantes');
      setAllEtudiantes([]);
    }
  };

  const fetchSelectedEtudiante = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/etudiante-normale/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.id) {
        setSelectedEtudiante(data);
        setEditingEtudiante(data);
      }
    } catch {
      alert('Erreur lors du chargement de l\'étudiante');
      setSelectedEtudiante(null);
      setEditingEtudiante({});
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchSelectedEtudiante(parseInt(selectedId));
    } else {
      setSelectedEtudiante(null);
      setEditingEtudiante({});
    }
  }, [selectedId]);

  const handleSubmitEtudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEtudiante(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/add-etudiante-normale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          classe_actuelle: classeActuelle,
          annee_academique: anneeAcademique,
          code_etudiante: codeEtudiante,
          nom: nomEtudiante,
          prenom: prenomEtudiante,
          option,
          sexe: sexeEtudiante,
          date_naissance: dateNaissance,
          commune,
          nom_derniere_ecole: nomDerniereEcole,
          district_derniere_ecole: districtDerniereEcole,
          derniere_classe: derniereClasse,
          annee_derniere_ecole: anneeDerniereEcole,
          mention_derniere_ecole: mentionDerniereEcole,
        }),
      });
      const data = await res.json();
      setMessageEtudiante(data.success ? 'Étudiante ajoutée avec succès' : data.message);
      if (data.success) {
        setClasseActuelle('');
        setAnneeAcademique('');
        setCodeEtudiante('');
        setNomEtudiante('');
        setPrenomEtudiante('');
        setOption('');
        setSexeEtudiante('');
        setDateNaissance('');
        setCommune('');
        setNomDerniereEcole('');
        setDistrictDerniereEcole('');
        setDerniereClasse('');
        setAnneeDerniereEcole('');
        setMentionDerniereEcole('');
        fetchEtudiantes();
        fetchAllEtudiantes(); // New: Refresh full list after add
      }
    } catch {
      setMessageEtudiante('Erreur lors de l\'ajout');
    } finally {
      setIsSubmittingEtudiante(false);
    }
  };

  const updateFieldEtudiante = async (field: string, value: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update-field-etudiante-normale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id: selectedId, field, value }),
      });
      if (!res.ok) alert('Erreur lors de la mise à jour');
      setEditingEtudiante((prev: any) => ({ ...prev, [field]: value }));
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteEtudiante = async (id: string) => {
    if (!window.confirm('Confirmer la suppression de l\'étudiante ?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/etudiante-normale/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setEtudiantes((prev) => prev.filter((e) => e.id.toString() !== id));
        setSelectedId('');
        setSelectedEtudiante(null);
        setEditingEtudiante({});
        fetchAllEtudiantes(); // New: Refresh full list after delete
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  // New: Generate Word document for liste formation
  const generateListeFormationWord = async () => {
    if (!allEtudiantes.length) {
      alert('Aucune étudiante à exporter.');
      return;
    }

    // Group by classe_actuelle and sort by nom
    const sections = {
      '1ère année': allEtudiantes.filter(e => e.classe_actuelle === '1ère année').sort((a, b) => a.nom.localeCompare(b.nom, undefined, { sensitivity: 'base' })),
      '2ème année': allEtudiantes.filter(e => e.classe_actuelle === '2ème année').sort((a, b) => a.nom.localeCompare(b.nom, undefined, { sensitivity: 'base' })),
      '3ème année': allEtudiantes.filter(e => e.classe_actuelle === '3ème année').sort((a, b) => a.nom.localeCompare(b.nom, undefined, { sensitivity: 'base' })),
    };

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Liste de formation - Normale',
                  bold: true,
                  size: 28,
                  centering: { type: AlignmentType.CENTER },
                }),
              ],
            }),
            // Table 1: 1ère année
            new Paragraph({
              children: [
                new TextRun({
                  text: '1ère année',
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...createTableRows(sections['1ère année']),
            // Table 2: 2ème année
            new Paragraph({
              children: [
                new TextRun({
                  text: '2ème année',
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...createTableRows(sections['2ème année']),
            // Table 3: 3ème année
            new Paragraph({
              children: [
                new TextRun({
                  text: '3ème année',
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),
            ...createTableRows(sections['3ème année']),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'liste_formation_normale.docx';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper: Create table rows for a section
  const createTableRows = (etudiantesSection: any[]) => {
    const headers = [
      'Nom de l\'étudiante', 'Prénom de l\'étudiante', 'Option', 'Sexe de l\'étudiante', 'Date de naissance de l’étudiante',
      'Commune', 'Nom dernière école', 'District dernière école', 'Dernière classe',
      'Année dernière école', 'Mention dernière école'
    ];

    let tableRows = [
      new TableRow({
        children: headers.map(header => new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: header, bold: true })],
          })],
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
        })),
      }),
    ];

    if (etudiantesSection.length === 0) {
      tableRows.push(
        new TableRow({
          children: headers.map(() => new TableCell({
            children: [new Paragraph('Aucune étudiante inscrite dans cette section.')],
            width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
          })),
        })
      );
    } else {
      etudiantesSection.forEach(etudiante => {
        const rowCells = [
          etudiante.nom, etudiante.prenom, etudiante.option, etudiante.sexe, etudiante.date_naissance,
          etudiante.commune, etudiante.nom_derniere_ecole, etudiante.district_derniere_ecole, etudiante.derniere_classe,
          etudiante.annee_derniere_ecole, etudiante.mention_derniere_ecole
        ].map(value => new TableCell({
          children: [new Paragraph(value || '')],
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
        }));
        tableRows.push(new TableRow({ children: rowCells }));
      });
    }

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      rows: tableRows,
    });

    return [table, new Paragraph({ spacing: { after: 400 } })];
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6 text-center">Accès Administrateur Normale</h2>
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
      <h1 className="text-3xl font-bold text-center">Informations Normale</h1>

      {/* Premier formulaire : Ajouter étudiante */}
      <section className="bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Ajouter une étudiante</h2>
        <form onSubmit={handleSubmitEtudiante} className="space-y-4">
          <input type="text" placeholder="Classe actuelle" value={classeActuelle} onChange={(e) => setClasseActuelle(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Année académique" value={anneeAcademique} onChange={(e) => setAnneeAcademique(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Code de l'étudiante" value={codeEtudiante} onChange={(e) => setCodeEtudiante(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Nom" value={nomEtudiante} onChange={(e) => setNomEtudiante(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Prénom" value={prenomEtudiante} onChange={(e) => setPrenomEtudiante(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Option" value={option} onChange={(e) => setOption(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Sexe" value={sexeEtudiante} onChange={(e) => setSexeEtudiante(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Date de naissance (jour/mois/année)" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Commune" value={commune} onChange={(e) => setCommune(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Nom dernière école" value={nomDerniereEcole} onChange={(e) => setNomDerniereEcole(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="District dernière école" value={districtDerniereEcole} onChange={(e) => setDistrictDerniereEcole(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Dernière classe" value={derniereClasse} onChange={(e) => setDerniereClasse(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Année dernière école" value={anneeDerniereEcole} onChange={(e) => setAnneeDerniereEcole(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Mention dernière école" value={mentionDerniereEcole} onChange={(e) => setMentionDerniereEcole(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <button type="submit" disabled={isSubmittingEtudiante} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center">
            {isSubmittingEtudiante ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Ajouter l\'étudiante'
            )}
          </button>
          {messageEtudiante && <p className="text-center">{messageEtudiante}</p>}
        </form>
      </section>

      {/* Section Étudiantes */}
      <section className="bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Étudiantes</h2>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        >
          <option value="">Sélectionnez une étudiante</option>
          {etudiantes
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
        {selectedEtudiante && (
          <div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Classe actuelle"
                value={editingEtudiante.classe_actuelle || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, classe_actuelle: e.target.value }))}
                onBlur={() => updateFieldEtudiante('classe_actuelle', editingEtudiante.classe_actuelle || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Année académique"
                value={editingEtudiante.annee_academique || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, annee_academique: e.target.value }))}
                onBlur={() => updateFieldEtudiante('annee_academique', editingEtudiante.annee_academique || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Code de l'étudiante"
                value={editingEtudiante.code_etudiante || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, code_etudiante: e.target.value }))}
                onBlur={() => updateFieldEtudiante('code_etudiante', editingEtudiante.code_etudiante || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Nom"
                value={editingEtudiante.nom || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, nom: e.target.value }))}
                onBlur={() => updateFieldEtudiante('nom', editingEtudiante.nom || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Prénom"
                value={editingEtudiante.prenom || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, prenom: e.target.value }))}
                onBlur={() => updateFieldEtudiante('prenom', editingEtudiante.prenom || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Option"
                value={editingEtudiante.option || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, option: e.target.value }))}
                onBlur={() => updateFieldEtudiante('option', editingEtudiante.option || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Sexe"
                value={editingEtudiante.sexe || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, sexe: e.target.value }))}
                onBlur={() => updateFieldEtudiante('sexe', editingEtudiante.sexe || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Date de naissance (jour/mois/année)"
                value={editingEtudiante.date_naissance || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, date_naissance: e.target.value }))}
                onBlur={() => updateFieldEtudiante('date_naissance', editingEtudiante.date_naissance || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Commune"
                value={editingEtudiante.commune || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, commune: e.target.value }))}
                onBlur={() => updateFieldEtudiante('commune', editingEtudiante.commune || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Nom dernière école"
                value={editingEtudiante.nom_derniere_ecole || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, nom_derniere_ecole: e.target.value }))}
                onBlur={() => updateFieldEtudiante('nom_derniere_ecole', editingEtudiante.nom_derniere_ecole || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="District dernière école"
                value={editingEtudiante.district_derniere_ecole || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, district_derniere_ecole: e.target.value }))}
                onBlur={() => updateFieldEtudiante('district_derniere_ecole', editingEtudiante.district_derniere_ecole || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Dernière classe"
                value={editingEtudiante.derniere_classe || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, derniere_classe: e.target.value }))}
                onBlur={() => updateFieldEtudiante('derniere_classe', editingEtudiante.derniere_classe || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Année dernière école"
                value={editingEtudiante.annee_derniere_ecole || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, annee_derniere_ecole: e.target.value }))}
                onBlur={() => updateFieldEtudiante('annee_derniere_ecole', editingEtudiante.annee_derniere_ecole || '')}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Mention dernière école"
                value={editingEtudiante.mention_derniere_ecole || ''}
                onChange={(e) => setEditingEtudiante((prev: any) => ({ ...prev, mention_derniere_ecole: e.target.value }))}
                onBlur={() => updateFieldEtudiante('mention_derniere_ecole', editingEtudiante.mention_derniere_ecole || '')}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div className="mt-6 flex space-x-4 justify-center">
              <button onClick={() => handleDeleteEtudiante(selectedId)} disabled={isDeleting} className="bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Supprimer l\'étudiante'
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* New Section: Liste de formation */}
      <section className="bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Liste de formation</h2>
        <button
          onClick={generateListeFormationWord}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
        >
          Télécharger la liste de formation
        </button>
      </section>
    </div>
  );
}
