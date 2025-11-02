import React, { useState } from 'react';
import { User } from '../types';
import { Link } from 'react-router-dom';

interface ResultatsProps {
  user: User | null;
}

interface Notes {
  [key: string]: number;
}

interface Period {
  periode: number;
  title: string;
  notes: Notes;
  moyenne: number;
}

interface Results {
  annee: string;
  periods: Period[];
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function Resultats({ user }: ResultatsProps) {
  const [code, setCode] = useState('');
  const [displayedCode, setDisplayedCode] = useState(''); // ← Nouveau état
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/resultats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setDisplayedCode(code); // ← On conserve le code soumis
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
    return <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
      <p className="text-xl">Veuillez vous <Link to="/connexion" className="text-green-600 hover:underline font-semibold">connecter</Link> pour voir vos résultats.</p>
    </div>;
  }

  return (
    <section className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">Consulter les résultats</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Entrez votre code étudiant"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Recherche...' : 'Voir les notes'}
        </button>
      </form>

      {message && <p className="mb-4 p-3 rounded-lg text-center bg-red-100 text-red-800">{message}</p>}

      {results && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            <span className="font-mono text-green-700 bg-green-50 px-2 py-1 rounded">{displayedCode}</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.periods.map((period) => (
              <div key={period.periode} className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
                <h4 className="text-xl font-bold mb-4 text-center text-slate-800">{period.title}</h4>
                <ul className="space-y-3 mb-4">
                  {Object.entries(period.notes).map(([matiere, note]) => {
                    const validNote = typeof note === 'number' ? note : 0;
                    return (
                      <li key={matiere} className="flex justify-between items-center p-3 bg-white rounded border">
                        <span className="font-medium text-gray-700 capitalize">{matiere}</span>
                        <span className={`font-bold text-lg ${validNote >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                          {validNote.toFixed(2)} / 20
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className={`text-center font-bold text-xl py-2 rounded ${period.moyenne >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Moyenne: {period.moyenne.toFixed(2)} / 20
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
                                                                              }
