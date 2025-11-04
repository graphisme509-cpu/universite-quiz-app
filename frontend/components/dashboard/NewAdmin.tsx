// components/dashboard/NewAdmin.tsx

import React, { useState, useEffect } from 'react';
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
  ShadingType,
} from 'docx';

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function NewAdmin() {
 const [adminCode, setAdminCode] = useState('');
 const [adminToken, setAdminToken] = useState('');
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [isLoggingIn, setIsLoggingIn] = useState(false);

 // New state for synthese visibility
 const [syntheseVisible, setSyntheseVisible] = useState(true);
 const [isToggling, setIsToggling] = useState(false);

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
 const [loadingMatiereKeys, setLoadingMatiereKeys] = useState<Set<string>>(new Set());

 // Form 3 states
 const [students, setStudents] = useState<string[]>([]);
 const [selectedCode, setSelectedCode] = useState('');
 const [results, setResults] = useState<any>(null);
 const [editingNotes, setEditingNotes] = useState<{ [key: string]: { [key: string]: number } }>({});
 const [editingOption, setEditingOption] = useState('');
 const [editingAcademicYears, setEditingAcademicYears] = useState<{ [key: number]: string }>({});
 const [isDeleting, setIsDeleting] = useState(false);

 const classes = ['1ère année', '2ème année', '3ème année'];
 const periodes = ['1ère période', '2ème période', '3ème période'];

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
 }
 finally {
   setIsLoggingIn(false);
 }
 };

 useEffect(() => {
 if (isLoggedIn) {
 fetchMatieres();
 fetchStudents();
 fetch(`${API_BASE_URL}/api/settings/synthese-visible`)
   .then(res => res.json())
   .then(data => setSyntheseVisible(data.visible))
   .catch(() => setSyntheseVisible(true));
 }
 }, [isLoggedIn]);

 const handleToggleSynthese = async () => {
 setIsToggling(true);
 const newVisible = !syntheseVisible;
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/toggle-synthese`, {
 method: 'POST',
 headers: { 
   'Content-Type': 'application/json',
   'Authorization': `Bearer ${adminToken}`
 },
 body: JSON.stringify({ visible: newVisible })
 });
 const data = await res.json();
 if (data.success) {
 setSyntheseVisible(newVisible);
 } else {
 alert('Erreur lors du changement de visibilité');
 }
 } catch {
 alert('Erreur réseau');
 }
 finally {
   setIsToggling(false);
 }
 };

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
 const add = matiereToAdd[`${cl}_${per}`]?.trim();
 if (!add) return;
 const key = `${cl}_${per}`;
 const addKey = `add_${key}`;
 setLoadingMatiereKeys(prev => new Set(prev).add(addKey));

 const newList = [...(allMatieres[key] || []), add];
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/matieres`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
 body: JSON.stringify({ classe: cl, periode: per, matieres: JSON.stringify(newList) }),
 });
 if (res.ok) {
 setAllMatieres((prev) => ({ ...prev, [key]: newList }));
 setMatiereToAdd((prev) => ({ ...prev, [key]: '' }));
 }
 } catch {
 alert('Erreur lors de l\'ajout');
 } finally {
 setLoadingMatiereKeys(prev => {
 const newSet = new Set(prev);
 newSet.delete(addKey);
 return newSet;
 });
 }
 };

 const handleRemoveMatiere = async (cl: string, per: string, mat: string) => {
 if (!window.confirm(`Voulez-vous vraiment supprimer la matière "${mat}" ?`)) return;

 const key = `${cl}_${per}`;
 const removeKey = `remove_${key}_${mat}`;
 setLoadingMatiereKeys(prev => new Set(prev).add(removeKey));

 const newList = (allMatieres[key] || []).filter((m) => m !== mat);
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/matieres`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
 body: JSON.stringify({ classe: cl, periode: per, matieres: JSON.stringify(newList) }),
 });
 if (res.ok) {
 setAllMatieres((prev) => ({ ...prev, [key]: newList }));
 }
 } catch {
 alert('Erreur lors de la suppression');
 } finally {
 setLoadingMatiereKeys(prev => {
 const newSet = new Set(prev);
 newSet.delete(removeKey);
 return newSet;
 });
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
 setIsDeleting(true);
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
 finally {
   setIsDeleting(false);
 }
 };

 const generateWordDocument = async () => {
   if (!results) return;

   const doc = new Document({
     sections: [
       {
         properties: {},
         children: [
           new Paragraph({
             children: [
               new TextRun({
                 text: "ÉCOLE NORMALE D'INSTITUTEURS ET DE JARDINIÈRES D'ENFANTS (ENIJE)",
                 bold: true,
                 size: 28,
                 centering: { type: AlignmentType.CENTER },
               }),
             ],
           }),
           new Paragraph({
             children: [
               new TextRun({
                 text: "Synthèse des résultats annuels",
                 bold: true,
                 size: 28,
                 centering: { type: AlignmentType.CENTER },
               }),
             ],
           }),
           new Paragraph({
             children: [
               new TextRun({
                 text: `Code de l'étudiante: ${selectedCode}`,
                 size: 24,
               }),
             ],
           }),
           new Paragraph({
             children: [
               new TextRun({
                 text: `Option: ${editingOption}`,
                 size: 24,
               }),
             ],
           }),
           ...results.years.flatMap((year: any) => {
             const p1 = year.periods[0]?.moyenne ?? 0;
             const p2 = year.periods[1]?.moyenne ?? 0;
             const p3 = year.periods[2]?.moyenne ?? 0;
             const genMoy = (p1 + p2 + p3) / 3;
             const avgPercent = genMoy;
             const decision = avgPercent >= 60 ? 'Admise' : avgPercent >= 50 ? 'Reprise' : 'Non admise';
             let mention = '';
             if (avgPercent >= 60) {
               if (avgPercent < 75) mention = 'Bien';
               else if (avgPercent < 90) mention = 'Très bien';
               else mention = 'Excellent';
             }
             let yearContent: any[] = [
               new Paragraph({
                 children: [
                   new TextRun({
                     text: `Année académique: ${year.academicYear} - ${year.classe}`,
                     bold: true,
                     size: 24,
                   }),
                 ],
                 spacing: { after: 200 },
               }),
             ];
             year.periods.forEach((period: any, index: number) => {
               if (Object.keys(period.notes).length === 0) return;
               const perName = ['1ère période', '2ème période', '3ème période'][index];
               const detailRows = [
                 new TableRow({
                   children: [
                     new TableCell({
                       children: [new Paragraph("Matière")],
                       width: { size: 50, type: WidthType.PERCENTAGE },
                     }),
                     new TableCell({
                       children: [new Paragraph("Note")],
                       width: { size: 50, type: WidthType.PERCENTAGE },
                     }),
                   ],
                 }),
                 ...Object.entries(period.notes).map(([matiere, note]) => new TableRow({
                   children: [
                     new TableCell({
                       children: [new Paragraph(matiere)],
                     }),
                     new TableCell({
                       children: [new Paragraph(`${(note as number).toFixed(2)} / 100`)],
                     }),
                   ],
                 })),
                 new TableRow({
                   children: [
                     new TableCell({
                       children: [new Paragraph("Moyenne")],
                       shading: { type: ShadingType.SOLID, color: "D3D3D3" },
                     }),
                     new TableCell({
                       children: [new Paragraph(`${period.moyenne.toFixed(2)} / 100`)],
                       shading: { type: ShadingType.SOLID, color: "D3D3D3" },
                     }),
                   ],
                 }),
               ];
               const detailTable = new Table({
                 width: {
                   size: 100,
                   type: WidthType.PERCENTAGE,
                 },
                 borders: {
                   top: { style: BorderStyle.SINGLE, size: 1 },
                   bottom: { style: BorderStyle.SINGLE, size: 1 },
                   left: { style: BorderStyle.SINGLE, size: 1 },
                   right: { style: BorderStyle.SINGLE, size: 1 },
                   insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                   insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                 },
                 rows: detailRows,
               });
               yearContent.push(
                 new Paragraph({
                   children: [
                     new TextRun({
                       text: perName,
                       bold: true,
                       size: 20,
                     }),
                   ],
                   spacing: { after: 100 },
                 }),
                 detailTable,
                 new Paragraph({ spacing: { after: 200 } })
               );
             });
             const summaryTable = new Table({
               width: {
                 size: 100,
                 type: WidthType.PERCENTAGE,
               },
               borders: {
                 top: { style: BorderStyle.SINGLE, size: 1 },
                 bottom: { style: BorderStyle.SINGLE, size: 1 },
                 left: { style: BorderStyle.SINGLE, size: 1 },
                 right: { style: BorderStyle.SINGLE, size: 1 },
                 insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                 insideVertical: { style: BorderStyle.SINGLE, size: 1 },
               },
               rows: [
                 new TableRow({
                   children: [
                     new TableCell({
                       children: [new Paragraph("Période")],
                       width: { size: 50, type: WidthType.PERCENTAGE },
                     }),
                     new TableCell({
                       children: [new Paragraph("Moyenne")],
                       width: { size: 50, type: WidthType.PERCENTAGE },
                     }),
                   ],
                 }),
                 ...(year.periods.map((period: any, index: number) => {
                   const perName = ['1ère période', '2ème période', '3ème période'][index];
                   const moy = period.moyenne ?? 0;
                   return new TableRow({
                     children: [
                       new TableCell({
                         children: [new Paragraph(perName)],
                       }),
                       new TableCell({
                         children: [new Paragraph(`${moy.toFixed(2)} / 100`)],
                       }),
                     ],
                   });
                 }) as any[]),
                 new TableRow({
                   children: [
                     new TableCell({
                       children: [new Paragraph("Moyenne générale")],
                       shading: { type: ShadingType.SOLID, color: "D3D3D3" },
                     }),
                     new TableCell({
                       children: [new Paragraph(`${genMoy.toFixed(2)} / 100`)],
                       shading: { type: ShadingType.SOLID, color: "D3D3D3" },
                     }),
                   ],
                 }),
                 new TableRow({
                   children: [
                     new TableCell({
                       children: [new Paragraph("Décision")],
                       shading: { type: ShadingType.SOLID, color: "90EE90" },
                     }),
                     new TableCell({
                       children: [new Paragraph(decision)],
                       shading: { type: ShadingType.SOLID, color: "90EE90" },
                     }),
                   ],
                 }),
                 ...(mention ? [
                   new TableRow({
                     children: [
                       new TableCell({
                         children: [new Paragraph("Mention")],
                         shading: { type: ShadingType.SOLID, color: "FFFFE0" },
                       }),
                       new TableCell({
                         children: [new Paragraph(mention)],
                         shading: { type: ShadingType.SOLID, color: "FFFFE0" },
                       }),
                     ],
                   })
                 ] : []),
               ],
             });
             yearContent.push(summaryTable);
             return yearContent;
           }),
         ],
       },
     ],
   });

   const blob = await Packer.toBlob(doc);
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `${selectedCode}_resultats.docx`;
   a.click();
   URL.revokeObjectURL(url);
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
 <div className="space-y-12">
 <h1 className="text-3xl font-bold text-center">Page Administration</h1>

 <section className="bg-white p-8 rounded-xl shadow-lg border">
 <h2 className="text-2xl font-bold mb-6">Ajouter des notes</h2>
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
 <button type="button" onClick={calculateMoyenneGenerale} disabled={isCalculating} className="hidden bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
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
 <h2 className="text-2xl font-bold mb-6">Matières</h2>
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
 <button
 onClick={() => handleRemoveMatiere(cl, per, m)}
 className="text-red-600 w-20 flex items-center justify-center"
 disabled={loadingMatiereKeys.has(`remove_${cl}_${per}_${m}`)}
 >
 {loadingMatiereKeys.has(`remove_${cl}_${per}_${m}`) ? (
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
 ) : (
 'Retirer'
 )}
 </button>
 </li>
 ))}
 </ul>
 <div className="flex space-x-2">
 <input
 type="text"
 value={matiereToAdd[key] || ''}
 onChange={(e) => setMatiereToAdd((prev) => ({ ...prev, [key]: e.target.value }))}
 placeholder="Nouvelle matière"
 className="flex-1 min-w-0 p-2 border rounded-lg"
 />
 <button
 onClick={() => handleAddMatiere(cl, per)}
 className="bg-green-600 text-white py-2 px-4 rounded-lg w-28 flex items-center justify-center"
 disabled={loadingMatiereKeys.has(`add_${key}`)}
 >
 {loadingMatiereKeys.has(`add_${key}`) ? (
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 ) : (
 'Ajouter'
 )}
 </button>
 </div>
 </div>
 );
 })
 ))}
 </section>

 <section className="bg-white p-8 rounded-xl shadow-lg border">
 <h2 className="text-2xl font-bold mb-6">Étudiantes</h2>
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
 <div className="text-center">
 <h3 className="text-2xl font-semibold mb-2">
 <span className="font-mono text-green-700 bg-green-50 px-2 py-1 rounded">{selectedCode}</span>
 </h3>
 <div className="flex items-center space-x-2 justify-center mb-4">
 <label className="font-bold whitespace-nowrap">Option:</label>
 <input
 type="text"
 value={editingOption}
 onChange={(e) => setEditingOption(e.target.value)}
 onBlur={() => updateField(selectedCode, 'option', editingOption)}
 className="flex-1 p-2 border rounded-lg max-w-md"
 />
 </div>
 </div>
 {results.years.map((year: any) => {
 const p1 = year.periods[0]?.moyenne ?? 0;
 const p2 = year.periods[1]?.moyenne ?? 0;
 const p3 = year.periods[2]?.moyenne ?? 0;
 const genMoy = (p1 + p2 + p3) / 3;
 const avgPercent = genMoy;
 return (
 <div key={year.annee} className="space-y-6 mb-12">
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
 {year.periods.map((period: any) => {
 if (Object.keys(period.notes).length === 0) {
 return null;
 }
 const periodKey = `${year.annee}_${period.periode}`;
 const editNotes = editingNotes[periodKey] || {};
 const noteValues = Object.values(editNotes);
 const totalVal = noteValues.reduce((acc: number, n: any) => acc + n, 0);
 const maxTotal = noteValues.length * 100;
 const passingNote = 50;
 return (
 <div key={period.periode} className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
 <h4 className="text-xl font-bold mb-1 text-center text-slate-800">{period.title}</h4>
 <p className="text-sm text-center text-gray-600 mb-1">{year.academicYear}</p>
 <p className="text-sm text-center text-gray-600 mb-4 font-medium">{year.classe}</p>
 <ul className="space-y-3 mb-4">
 {Object.entries(editNotes).map(([matiere, note]) => {
 const currentNote = editNotes[matiere] || 0;
 return (
 <li key={matiere} className="flex justify-between items-center p-3 bg-white rounded border">
 <span className="font-medium text-gray-700">{matiere}</span>
 <input
 type="number"
 min={0}
 max={100}
 step={0.01}
 value={editNotes[matiere] !== undefined ? editNotes[matiere] : ''}
 onChange={(e) => setEditingNotes((prev) => ({
 ...prev,
 [periodKey]: { ...prev[periodKey], [matiere]: parseFloat(e.target.value) || 0 },
 }))}
 onBlur={(e) => updateField(selectedCode, 'note', parseFloat(e.target.value) || 0, {
 annee: year.annee,
 periode: period.periode,
 matiere,
 })}
 className={`w-24 text-right border rounded p-1 ${currentNote >= passingNote ? 'text-green-600' : 'text-red-600'}`}
 />
 </li>
 );
 })}
 </ul>
 <div className="text-center font-medium py-1 mb-2 min-w-[120px] mx-auto">
 Total: {totalVal.toFixed(2)} / {maxTotal}
 </div>
 <div className={`text-center font-bold text-xl py-2 rounded min-w-[120px] mx-auto ${period.moyenne >= passingNote ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
 Moyenne: {period.moyenne.toFixed(2)} / 100
 </div>
 </div>
 );
 })}
 </div>
 {syntheseVisible && (
 <div className="mt-6 mb-12">
 <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-200">
 <h4 className="text-xl font-bold mb-4 text-center text-blue-800">ÉCOLE NORMALE D'INSTITUTEURS ET DE JARDINIÈRES D'ENFANTS (ENIJE)</h4>
 <h4 className="text-xl font-bold mb-4 text-center text-blue-800">Synthèse des résultats annuels</h4>
 <table className="w-full table-auto border-collapse border border-blue-300">
 <tbody className="divide-y divide-blue-200">
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-left text-sm">Code de l'étudiante</td>
 <td className="px-4 py-2 text-sm text-left">{selectedCode}</td>
 </tr>
 <tr>
 <td className="px-4 py-2 font-medium text-left text-sm">Option</td>
 <td className="px-4 py-2 text-sm text-left">{editingOption}</td>
 </tr>
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-left text-sm">Classe</td>
 <td className="px-4 py-2 text-sm text-left">{year.classe}</td>
 </tr>
 <tr>
 <td className="px-4 py-2 font-medium text-left text-sm">1ère période</td>
 <td className="px-4 py-2 min-w-[90px] text-left text-sm">{p1.toFixed(2)} / 100</td>
 </tr>
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-left text-sm">2ème période</td>
 <td className="px-4 py-2 min-w-[90px] text-left text-sm">{p2.toFixed(2)} / 100</td>
 </tr>
 <tr>
 <td className="px-4 py-2 font-medium text-left text-sm">3ème période</td>
 <td className="px-4 py-2 min-w-[90px] text-left text-sm">{p3.toFixed(2)} / 100</td>
 </tr>
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-left text-sm">Moyenne générale</td>
 <td className="px-4 py-2 font-bold min-w-[90px] text-left text-sm">
 {genMoy.toFixed(2)} / 100
 </td>
 </tr>
 <tr className="bg-green-100">
 <td className="px-4 py-2 font-medium text-left text-sm">Décision</td>
 <td className="px-4 py-2 font-bold text-green-700 text-sm text-left">
 {avgPercent >= 60 ? 'Admise' : avgPercent >= 50 ? 'Reprise' : 'Non admise'}
 </td>
 </tr>
 {avgPercent >= 60 && (
 <tr className="bg-yellow-100">
 <td className="px-4 py-2 font-medium text-left text-sm">Mention</td>
 <td className="px-4 py-2 font-bold text-yellow-700 text-sm text-left">
 {avgPercent < 75 ? 'Bien' : avgPercent < 90 ? 'Très bien' : 'Excellent'}
 </td>
 </tr>
 )}
 <tr className="bg-blue-100">
 <td className="px-4 py-2 font-medium text-left text-sm">Année académique</td>
 <td className="px-4 py-2 text-sm text-left">{year.academicYear}</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
 })}
 <div className="mt-6 flex space-x-4 justify-center">
 <button onClick={generateWordDocument} className="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700">
   Télécharger en Word
 </button>
 <button onClick={() => handleDeleteStudent(selectedCode)} disabled={isDeleting} className="bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
 {isDeleting ? (
   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 ) : (
   'Supprimer l\'étudiant'
 )}
 </button>
 </div>
 </div>
 )}
 </section>

 <section className="bg-white p-8 rounded-xl shadow-lg border">
   <h2 className="text-2xl font-bold mb-6">Visibilité de la Synthèse des résultats annuels (page Résultats)</h2>
   <div className="flex items-center space-x-4">
     <span className="text-lg">Actuellement: {syntheseVisible ? 'Visible' : 'Cachée'}</span>
     <button
       onClick={handleToggleSynthese}
       disabled={isToggling}
       className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
     >
       {isToggling ? (
         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
       ) : (
         syntheseVisible ? 'Cacher' : 'Afficher'
       )}
     </button>
   </div>
 </section>
 </div>
 );
}
