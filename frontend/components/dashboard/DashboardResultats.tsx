import React, { useEffect, useState } from 'react';
import { User } from '../../types';

interface DashboardResultatsProps {
 user: User;
}

interface Notes {
 [key: string]: number | null; // ← Ajout : autorise null pour réalité DB
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function DashboardResultats({ user }: DashboardResultatsProps) {
 const [notes, setNotes] = useState<Notes | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 useEffect(() => {
 const fetchResultats = async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/api/resultats`, { 
 credentials: 'include',
 cache: 'no-store' // ← Ajout : anti-cache pour fresh data
 });
 if (!res.ok) {
 if (res.status === 404) throw new Error("Aucun résultat universitaire n'est encore associé à votre compte.");
 throw new Error("Impossible de charger vos résultats.");
 }
 const data = await res.json();
 console.log('Fetched data:', data); // ← Debug : check en console ce qui arrive (devrait montrer notes avec potentiels null)
 if (data.error || !data.success) throw new Error(data.message || "Une erreur est survenue.");
 setNotes(data.notes);
 } catch (err: any) {
 console.error('Fetch error:', err); // ← Debug : si erreur fetch
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };
 fetchResultats();
 }, [user]);

 if (loading) return (
 <div className="flex justify-center items-center p-8">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
 </div>
 );

 return (
 <section className="space-y-6">
 <h1 className="text-4xl font-bold text-slate-800">Mes Notes Universitaires</h1>
 <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
 {error ? (
 <div className="text-center p-8 bg-yellow-50 text-yellow-800 rounded-lg">
 <p className="font-semibold">{error}</p>
 </div>
 ) : notes ? (
 <div className="space-y-4">
 <h2 className="text-2xl font-semibold text-center mb-6">Relevé de notes</h2>
 <ul className="space-y-3 max-w-md mx-auto">
 {Object.entries(notes).map(([matiere, note]) => {
 const validNote = typeof note === 'number' ? note : 0; // ← Fix clé : fallback à 0 si null/NaN/undefined
 console.log(`Note for ${matiere}:`, note); // ← Debug : check valeurs en console
 return (
 <li key={matiere} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
 <span className="font-medium text-gray-700 capitalize">{matiere}</span>
 <span className={`font-bold text-xl ${validNote >= 10 ? 'text-green-600' : 'text-red-600'}`}>
 {validNote.toFixed(2)} / 20
 </span>
 </li>
 );
 })}
 </ul>
 </div>
 ) : (
 <div className="text-center p-8">
 <p>Aucune note à afficher.</p>
 </div>
 )}
 </div>
 </section>
 );
}
