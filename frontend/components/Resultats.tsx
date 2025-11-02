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
  option: string;
  periods: Period[];
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function Resultats({ user }: ResultatsProps) {
  const [code, setCode] = useState('');
  const [displayedCode, setDisplayedCode] = useState('');
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
        setDisplayedCode(code);
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
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2">
              <span className="font-mono text-green-700 bg-green-50 px-2 py-1 rounded">{displayedCode}</span>
            </h3>
            <p className="text-lg font-medium text-gray-700">Option: <span className="text-green-700">{results.option}</span></p>
          </div>
          {(() => {
            const allNotes = results.periods.flatMap(period => Object.values(period.notes).filter(n => typeof n === 'number'));
            const maxPerSubject = allNotes.length > 0 ? Math.max(...allNotes) : 100;
            const passingNote = maxPerSubject / 2;

            return (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                  {results.periods.map((period) => {
                    const noteValues = Object.values(period.notes).map(n => typeof n === 'number' ? n : 0);
                    const total = noteValues.reduce((acc, n) => acc + n, 0);
                    const maxTotal = noteValues.length * maxPerSubject;
                    return (
                      <div key={period.periode} className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200">
                        <h4 className="text-xl font-bold mb-4 text-center text-slate-800">{period.title}</h4>
                        <ul className="space-y-3 mb-4">
                          {Object.entries(period.notes).map(([matiere, note]) => {
                            const validNote = typeof note === 'number' ? note : 0;
                            return (
                              <li key={matiere} className="flex justify-between items-center p-3 bg-white rounded border">
                                <span className="font-medium text-gray-700 capitalize">{matiere}</span>
                                <span className={`font-bold ${validNote >= passingNote ? 'text-green-600' : 'text-red-600'} min-w-[90px] text-right whitespace-nowrap`}>
                                  {validNote.toFixed(2)} / {maxPerSubject.toFixed(0)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="text-center font-medium py-1 mb-2 min-w-[120px] mx-auto">
                          Total: {total.toFixed(2)} / {maxTotal.toFixed(0)}
                        </div>
                        <div className={`text-center font-bold text-xl py-2 rounded ${period.moyenne >= passingNote ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} min-w-[120px] mx-auto`}>
                          Moyenne: {period.moyenne.toFixed(2)} / {maxPerSubject.toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {results.periods.length === 3 && (
                  <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-200">
                    <h4 className="text-xl font-bold mb-4 text-center text-blue-800">Liste de décision</h4>
                    <table className="w-full table-auto border-collapse border border-blue-300">
                      <tbody className="divide-y divide-blue-200">
                        <tr className="bg-blue-100">
                          <td className="px-4 py-2 font-medium text-left text-sm">Code de l'étudiante</td>
                          <td className="px-4 py-2 text-sm text-left">{displayedCode}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium text-left text-sm">Option</td>
                          <td className="px-4 py-2 text-sm text-left">{results.option}</td>
                        </tr>
                        <tr className="bg-blue-100">
                          <td className="px-4 py-2 font-medium text-left text-sm">1ère période</td>
                          <td className="px-4 py-2 min-w-[90px] text-left text-sm">{results.periods[0].moyenne.toFixed(2)} / {maxPerSubject.toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium text-left text-sm">2ème période</td>
                          <td className="px-4 py-2 min-w-[90px] text-left text-sm">{results.periods[1].moyenne.toFixed(2)} / {maxPerSubject.toFixed(0)}</td>
                        </tr>
                        <tr className="bg-blue-100">
                          <td className="px-4 py-2 font-medium text-left text-sm">3ème période</td>
                          <td className="px-4 py-2 min-w-[90px] text-left text-sm">{results.periods[2].moyenne.toFixed(2)} / {maxPerSubject.toFixed(0)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium text-left text-sm">Moyenne générale</td>
                          <td className="px-4 py-2 font-bold min-w-[90px] text-left text-sm">
                            {((results.periods[0].moyenne + results.periods[1].moyenne + results.periods[2].moyenne) / 3).toFixed(2)} / {maxPerSubject.toFixed(0)}
                          </td>
                        </tr>
                        <tr className="bg-green-100">
                          <td className="px-4 py-2 font-medium text-left text-sm">Décision</td>
                          <td className="px-4 py-2 font-bold text-green-700 text-sm text-left">
                            {(() => {
                              const genMoy = (results.periods[0].moyenne + results.periods[1].moyenne + results.periods[2].moyenne) / 3;
                              const avgPercent = (genMoy / maxPerSubject) * 100;
                              if (avgPercent >= 60) return 'Admise';
                              if (avgPercent >= 50) return 'Reprise';
                              return 'Non admise';
                            })()}
                          </td>
                        </tr>
                        {(() => {
                          const genMoy = (results.periods[0].moyenne + results.periods[1].moyenne + results.periods[2].moyenne) / 3;
                          const avgPercent = (genMoy / maxPerSubject) * 100;
                          const decision = avgPercent >= 60 ? 'Admise' : avgPercent >= 50 ? 'Reprise' : 'Non admise';
                          if (decision === 'Admise') {
                            let mention = '';
                            if (avgPercent < 75) mention = 'Bien';
                            else if (avgPercent < 90) mention = 'Très bien';
                            else mention = 'Excellent';
                            return (
                              <tr className="bg-yellow-100">
                                <td className="px-4 py-2 font-medium text-left text-sm">Mention</td>
                                <td className="px-4 py-2 font-bold text-yellow-700 text-sm text-left">{mention}</td>
                              </tr>
                            );
                          }
                          return null;
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </section>
  );
          }
