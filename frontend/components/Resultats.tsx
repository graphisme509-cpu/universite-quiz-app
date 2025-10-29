
import React, { useState } from 'react';
import { User } from '../types';
import { Link } from 'react-router-dom';

interface ResultatsProps {
  user: User | null;
}

interface Notes {
  [key: string]: number;
}

export default function Resultats({ user }: ResultatsProps) {
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState<Notes | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotes(null);
    setMessage('');
    try {
      const res = await fetch('https://universite-quiz-app-production.up.railway.app/api/resultats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        setNotes(data.notes);
      } else {
        setMessage(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setMessage('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-xl">Veuillez vous <Link to="/connexion" className="text-blue-600 hover:underline">connecter</Link> pour voir vos résultats.</p>
    </div>;
  }

  return (
    <section className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6">Consulter mes Résultats</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input type="text" placeholder="Entrez votre code étudiant" value={code} onChange={(e) => setCode(e.target.value)} required className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
          {loading ? 'Recherche...' : 'Voir mes notes'}
        </button>
      </form>

      {message && <p className="mt-4 p-3 rounded-lg text-center bg-red-100 text-red-800">{message}</p>}

      {notes && (
        <div className="mt-8 p-6 border-t border-gray-200">
            <h3 className="text-2xl font-semibold mb-4 text-center">Vos notes pour le code : <span className="font-mono text-blue-700">{code}</span></h3>
            <ul className="space-y-3">
            {Object.entries(notes).map(([matiere, note]) => (
                <li key={matiere} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{matiere}</span>
                    {/* FIX: Cast note to number to allow comparison and toFixed call */}
                    <span className={`font-bold text-lg ${(note as number) >= 10 ? 'text-green-600' : 'text-red-600'}`}>{(note as number).toFixed(2)} / 20</span>
                </li>
            ))}
            </ul>
        </div>
      )}
    </section>
  );
}
