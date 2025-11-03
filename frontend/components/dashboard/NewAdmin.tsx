// components/dashboard/NewAdmin.tsx

import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function NewAdmin() {
 const [adminCode, setAdminCode] = useState('');
 const [adminToken, setAdminToken] = useState('');
 const [isLoggedIn, setIsLoggedIn] = useState(false);

 // Form 1 states
 const [code, setCode] = useState('');
 const [option, setOption] = useState('Jardinière');
 const [academicYear, setAcademicYear] = useState('');
 const [periode, setPeriode] = useState('1ère période');
 const [classe, setClasse] = useState('1ère année');
 const [notes, setNotes] = useState<{ [key: string]: number }>({});
 const [moyenneGenerale, setMoyenneGenerale] = useState('0 / 100');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isCalculating, setIsCalculating] = useState(false);

 // Common
 const [allMatieres, setAllMatieres] = useState<{ [key: string]: string[] }>({});
 const [message1, setMessage1] = useState('');

 // Form 2 states
 const [matiereToAdd, setMatiereToAdd] = useState<{ [key: string]: string }>({});

 // Form 3 states
 const [students, setStudents] = useState<string[]>([]);
 const [selectedCode, setSelectedCode] = useState('');
 const [results, setResults] = useState<any>(null);
 const [editingNotes, setEditingNotes] = useState<{ [key: string]: { [key: string]: number } }>({});
 const [editingOption, setEditingOption] = useState('');
 const [editingAcademicYears, setEditingAcademicYears] = useState<{ [key: number]: string }>({});

 const classes = ['1ère année', '2ème année', '3ème année'];
 const periodes = ['1ère période', '2ème période', '3ème période'];

 const handleAdminLogin = async (e: React.FormEvent) => {
 e.preventDefault();
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
 }
 };

 useEffect(() => {
 if (isLoggedIn) {
 fetchMatieres();
 fetchStudents();
 }
 }, [isLoggedIn]);

 const fetchMatieres = async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/matieres`, {
 headers: { Authorization: `Bearer ${adminToken}` },
 });
 const data = await res.json();
 const mapped: { [key: string]: string[] } = {};
 data.forEach((item: any) => {
 mapped[`${item.classe}_${item.periode}`] = item.matieres;
 });
 setAllMatieres(mapped);
 } catch {
 alert('Erreur lors du chargement des matières');
 }
 };

 const fetchStudents = async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/students`, {
 headers: { Authorization: `Bearer ${adminToken}` },
 });
 const data = await res.json();
 setStudents(data);
 } catch {
 alert('Erreur lors du chargement des étudiants');
 }
 };

 const fetchResults = async (code: string) => {
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/get-results?code=${code}`, {
 headers: { Authorization: `Bearer ${adminToken}` },
 });
 const data = await res.json();
 if (data.success) {
 setResults(data.results);
 setEditingOption(data.results.option);
 const acad: { [key: number]: string } = {};
 data.results.years.forEach((year: any) => {
 acad[year.annee] = year.academicYear;
 });
 setEditingAcademicYears(acad);
 // Prepare editing notes
 const editNotes: { [key: string]: { [key: string]: number } } = {};
 data.results.years.forEach((year: any) => {
 year.periods.forEach((period: any) => {
 const key = `${year.annee}_${period.periode}`;
 editNotes[key] = { ...period.notes };
 });
 });
 setEditingNotes(editNotes);
 } else {
 alert(data.message);
 }
 } catch {
 alert('Erreur lors du chargement des résultats');
 }
 };

 useEffect(() => {
 if (selectedCode) {
 fetchResults(selectedCode);
 }
 }, [selectedCode]);

 const currentKey = `${classe}_${periode}`;
 const currentMatieres = allMatieres[currentKey] || [];
 const sumNotes = Object.values(notes).reduce((sum, n) => sum + (n || 0), 0);
 const numSubjects = currentMatieres.length;
 const total = numSubjects > 0 ? `${sumNotes} / ${numSubjects * 100}` : '0 / 0';
 const moyenne = numSubjects > 0 ? `${(sumNotes / numSubjects).toFixed(2)} / 100` : '0 / 100';

 const handleNoteChange = (matiere: string, value: string) => {
 setNotes((prev) => ({ ...prev, [matiere]: parseFloat(value) || 0 }));
 };

 const calculateMoyenneGenerale = async () => {
 if (!code || !classe) return;
 setIsCalculating(true);
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/get-results?code=${code}`, {
 headers: { Authorization: `Bearer ${adminToken}` },
 });
 const data = await res.json();
 if (data.success) {
 const anneeNum = classes.indexOf(classe) + 1;
 const year = data.results.years.find((y: any) => y.annee === anneeNum);
 if (year) {
 const avg = year.periods.reduce((sum: number, p: any) => sum + p.moyenne, 0) / year.periods.length;
 setMoyenneGenerale(`${avg.toFixed(2)} / 100`);
 }
 }
 } catch {}
 finally {
   setIsCalculating(false);
 }
 };

 const handleSubmitForm1 = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/update-results`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
 body: JSON.stringify({ code, option, academicYear, classe, periode, notes }),
 });
 const data = await res.json();
 setMessage1(data.success ? 'Sauvegardé avec succès' : data.message);
 calculateMoyenneGenerale();
 } catch {
 setMessage1('Erreur lors de la sauvegarde');
 }
 finally {
   setIsSubmitting(false);
 }
 };

 const handleAddMatiere = async (cl: string, per: string) => {
 const add = matiereToAdd[`${cl}_${per}`].trim();
 if (!add) return;
 const key = `${cl}_${per}`;
 const newList = [...(allMatieres[key] || []), add];
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/matieres`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
 body: JSON.stringify({ classe: cl, periode: per, matieres: JSON.stringify(newList) }), // <-- CORRECTION ICI
 });
 if (res.ok) {
 setAllMatieres((prev) => ({ ...prev, [key]: newList }));
 setMatiereToAdd((prev) => ({ ...prev, [key]: '' }));
 }
 } catch {
 alert('Erreur lors de l\'ajout');
 }
 };

 const handleRemoveMatiere = async (cl: string, per: string, mat: string) => {
 const key = `${cl}_${per}`;
 const newList = (allMatieres[key] || []).filter((m) => m !== mat);
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/matieres`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
 body: JSON.stringify({ classe: cl, periode: per, matieres: JSON.stringify(newList) }), // <-- CORRECTION ICI
 });
 if (res.ok) {
 setAllMatieres((prev) => ({ ...prev, [key]: newList }));
 }
 } catch {
 alert('Erreur lors de la suppression');
 }
 };

 const updateField = async (code: string, field: string, value: any, extra?: { annee?: number, periode?: number, matiere?: string }) => {
 try {
 const body = { code, field, value, ...extra };
 const res = await fetch(`${API_BASE_URL}/api/admin/update-field`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
 body: JSON.stringify(body),
 });
 if (!res.ok) alert('Erreur lors de la mise à jour');
 } catch {
 alert('Erreur lors de la mise à jour');
 }
 };

 const handleDeleteStudent = async (code: string) => {
 if (!window.confirm('Confirmer la suppression de l\'étudiant ?')) return;
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/student/${code}`, {
 method: 'DELETE',
 headers: { Authorization: `Bearer ${adminToken}` },
 });
 if (res.ok) {
 setStudents((prev) => prev.filter((c) => c !== code));
 setSelectedCode('');
 setResults(null);
 } else {
 alert('Erreur lors de la suppression');
 }
 } catch {
 alert('Erreur lors de la suppression');
 }
 };

 if (!isLoggedIn) {
 return (
 <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border">
 <h2 className="text-2xl font-bold mb-6 text-center">Accès Administrateur</h2>
 <form onSubmit={handleAdminLogin} className="space-y-4">
 <input
 type="password"
 placeholder="Code administrateur"
 value={adminCode}
 onChange={(e) => setAdminCode(e.target.value)}
 className="w-full p-3 border rounded-lg"
 />
 <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
 Entrer
 </button>
 </form>
 </div>
 );
 }

 return (
 <div className="space-y-12">
 <h1 className="text-3xl font-bold text-center">Page Administration</h1>

 <section className="bg-white p-8 rounded-xl shadow-lg border">
 <h2 className="text-2xl font-bold mb-6">Ajouter/Modifier Notes Étudiante</h2>
 <form onSubmit={handleSubmitForm1} className="space-y-4">
 <input
 type="text"
 placeholder="Code (ex: ETU-J-2024-040-A)"
 value={code}
 onChange={(e) => setCode(e.target.value)}
 required
 className="w-full p-3 border rounded-lg"
 />
 <select
 value={option}
 onChange={(e) => setOption(e.target.value)}
 className="w-full p-3 border rounded-lg"
 >
 <option>Jardinière</option>
 <option>Aide-jardinière</option>
 </select>
 <input
 type="text"
 placeholder="Année académique (ex: 2022-23)"
 value={academicYear}
 onChange={(e) => setAcademicYear(e.target.value)}
 required
 className="w-full p-3 border rounded-lg"
 />
 <select
 value={periode}
 onChange={(e) => { setPeriode(e.target.value); setNotes({}); }}
 className="w-full p-3 border rounded-lg"
 >
 {periodes.map((p) => <option key={p}>{p}</option>)}
 </select>
 <select
 value={classe}
 onChange={(e) => { setClasse(e.target.value); setNotes({}); }}
 className="w-full p-3 border rounded-lg"
 >
 {classes.map((c) => <option key={c}>{c}</option>)}
 </select>
 {currentMatieres.map((matiere) => (
 <div key={matiere} className="flex items-center space-x-2">
 <label className="w-1/2">{matiere}</label>
 <input
 type="number"
 min={0}
 max={100}
 step={0.01}
 value={notes[matiere] || ''}
 onChange={(e) => handleNoteChange(matiere, e.target.value)}
 className="w-1/2 p-2 border rounded-lg"
 />
 </div>
 ))}
 <div>Total: {total}</div>
 <div>Moyenne: {moyenne}</div>
 <div>Moyenne générale: {moyenneGenerale}</div>
 <button type="button" onClick={calculateMoyenneGenerale} disabled={isCalculating} className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
 {isCalculating ? (
   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 ) : (
   'Calculer Moyenne Générale'
 )}
 </button>
 <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center">
 {isSubmitting ? (
   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 ) : (
   'Soumettre'
 )}
 </button>
 {message1 && <p className="text-center">{message1}</p>}
 </form>
 </section>

 <section className="bg-white p-8 rounded-xl shadow-lg border">
 <h2 className="text-2xl font-bold mb-6">Matières Prédéfinies</h2>
 {classes.map((cl) => (
 periodes.map((per) => {
 const key = `${cl}_${per}`;
 const list = allMatieres[key] || [];
 return (
 <div key={key} className="mb-6">
 <h3 className="text-xl font-semibold mb-2">{cl} - {per}</h3>
 <ul className="space-y-2 mb-4">
 {list.map((m) => (
 <li key={m} className="flex justify-between">
 {m}
 <button onClick={() => handleRemoveMatiere(cl, per, m)} className="text-red-600">Retirer</button>
 </li>
 ))}
 </ul>
 <div className="flex space-x-2">
 <input
 type="text"
 value={matiereToAdd[key] || ''}
 onChange={(e) => setMatiereToAdd((prev) => ({ ...prev, [key]: e.target.value }))}
 placeholder="Nouvelle matière"
 className="flex-grow p-2 border rounded-lg"
 />
 <button onClick={() => handleAddMatiere(cl, per)} className="bg-green-600 text-white py-2 px-4 rounded-lg">
 Ajouter
 </button>
 </div>
 </div>
 );
 })
 ))}
 </section>

 <section className="bg-white p-8 rounded-xl shadow-lg border">
 <h2 className="text-2xl font-bold mb-6">Étudiants Enregistrés</h2>
 <select
 value={selectedCode}
 onChange={(e) => setSelectedCode(e.target.value)}
 className="w-full p-3 border rounded-lg mb-4"
 >
 <option value="">Sélectionnez un code</option>
 {students.map((c) => <option key={c} value={c}>{c}</option>)}
 </select>
 {results && (
 <div>
 <div className="flex items-center space-x-4 mb-4">
 <label>Option:</label>
 <input
 type="text"
 value={editingOption}
 onChange={(e) => setEditingOption(e.target.value)}
 onBlur={() => updateField(selectedCode, 'option', editingOption)}
 className="p-2 border rounded-lg"
 />
 <button onClick={() => handleDeleteStudent(selectedCode)} className="bg-red-600 text-white py-2 px-4 rounded-lg">
 Supprimer l'étudiant
 </button>
 </div>
 {results.years.map((year: any) => (
 <div key={year.annee} className="mb-8">
 <div className="flex items-center space-x-4 mb-4">
 <h3 className="text-xl font-bold">{year.classe} - Année académique:</h3>
 <input
 type="text"
 value={editingAcademicYears[year.annee] || ''}
 onChange={(e) => setEditingAcademicYears((prev) => ({ ...prev, [year.annee]: e.target.value }))}
 onBlur={() => updateField(selectedCode, 'academicYear', editingAcademicYears[year.annee], { annee: year.annee })}
 className="p-2 border rounded-lg"
 />
 </div>
 <div className="grid md:grid-cols-3 gap-6">
 {year.periods.map((period: any) => {
 const periodKey = `${year.annee}_${period.periode}`;
 const editNotes = editingNotes[periodKey] || {};
 const noteValues = Object.values(editNotes);
 const totalVal = noteValues.reduce((acc: number, n: any) => acc + n, 0);
 const maxTotal = noteValues.length * 100;
 return (
 <div key={period.periode} className="bg-gray-50 p-6 rounded-lg shadow border">
 <h4 className="text-xl font-bold mb-4 text-center">{period.title}</h4>
 <ul className="space-y-3 mb-4">
 {Object.entries(period.notes).map(([matiere, note]) => (
 <li key={matiere} className="flex justify-between items-center p-3 bg-white rounded border">
 <span className="font-medium">{matiere}</span>
 <input
 type="number"
 min={0}
 max={100}
 step={0.01}
 value={editNotes[matiere] || ''}
 onChange={(e) => setEditingNotes((prev) => ({
 ...prev,
 [periodKey]: { ...prev[periodKey], [matiere]: parseFloat(e.target.value) || 0 },
 }))}
 onBlur={(e) => updateField(selectedCode, 'note', parseFloat(e.target.value) || 0, {
 annee: year.annee,
 periode: period.periode,
 matiere,
 })}
 className="w-24 text-right border rounded p-1"
 />
 </li>
 ))}
 </ul>
 <div className="text-center font-medium mb-2">Total: {totalVal.toFixed(2)} / {maxTotal}</div>
 <div className="text-center font-bold text-xl py-2 rounded bg-green-100 text-green-700">
 Moyenne: {period.moyenne.toFixed(2)} / 100
 </div>
 </div>
 );
 })}
 </div>
 {/* Synthèse similaire à Resultats.tsx, mais non éditable ici */}
 <div className="bg-blue-50 p-6 rounded-lg shadow border mt-6">
 <h4 className="text-xl font-bold mb-4 text-center text-blue-800">Synthèse des résultats annuels</h4>
 <table className="w-full border-collapse border">
 <tbody>
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-sm">Code de l'étudiante</td>
 <td className="px-4 py-2 text-sm">{selectedCode}</td>
 </tr>
 <tr>
 <td className="px-4 py-2 font-medium text-sm">Option</td>
 <td className="px-4 py-2 text-sm">{results.option}</td>
 </tr>
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-sm">Classe</td>
 <td className="px-4 py-2 text-sm">{year.classe}</td>
 </tr>
 <tr>
 <td className="px-4 py-2 font-medium text-sm">1ère période</td>
 <td className="px-4 py-2 text-sm">{year.periods[0].moyenne.toFixed(2)} / 100</td>
 </tr>
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-sm">2ème période</td>
 <td className="px-4 py-2 text-sm">{year.periods[1].moyenne.toFixed(2)} / 100</td>
 </tr>
 <tr>
 <td className="px-4 py-2 font-medium text-sm">3ème période</td>
 <td className="px-4 py-2 text-sm">{year.periods[2].moyenne.toFixed(2)} / 100</td>
 </tr>
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-sm">Moyenne générale</td>
 <td className="px-4 py-2 font-bold text-sm">
 {((year.periods[0].moyenne + year.periods[1].moyenne + year.periods[2].moyenne) / 3).toFixed(2)} / 100
 </td>
 </tr>
 <tr className="bg-green-100">
 <td className="px-4 py-2 font-medium text-sm">Décision</td>
 <td className="px-4 py-2 font-bold text-green-700 text-sm">
 {(() => {
 const genMoy = (year.periods[0].moyenne + year.periods[1].moyenne + year.periods[2].moyenne) / 3;
 const avgPercent = genMoy;
 if (avgPercent >= 60) return 'Admise';
 if (avgPercent >= 50) return 'Reprise';
 return 'Non adm ise';
 })()}
 </td>
 </tr>
 {(() => {
 const genMoy = (year.periods[0].moyenne + year.periods[1].moyenne + year.periods[2].moyenne) / 3;
 const avgPercent = genMoy;
 if (avgPercent >= 60) {
 let mention = '';
 if (avgPercent < 75) mention = 'Bien';
 else if (avgPercent < 90) mention = 'Très bien';
 else mention = 'Excellent';
 return (
 <tr className="bg-yellow-100">
 <td className="px-4 py-2 font-medium text-sm">Mention</td>
 <td className="px-4 py-2 font-bold text-yellow-700 text-sm">{mention}</td>
 </tr>
 );
 }
 return null;
 })()}
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-sm">Année académique</td>
 <td className="px-4 py-2 text-sm">{year.academicYear}</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 ))}
 </div>
 )}
 </section>
 </div>
 );
 }
