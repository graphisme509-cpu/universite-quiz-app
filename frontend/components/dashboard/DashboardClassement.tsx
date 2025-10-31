import React, { useEffect, useState } from 'react';
import { User, ClassementEntry } from '../../types';  // Vérifie types.ts : export interface ClassementEntry { rank: number; name: string; score: number; xp: number; badges: string[]; }

interface DashboardClassementProps {
  user: User;
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function DashboardClassement({ user }: DashboardClassementProps) {
  console.log('🔥 DashboardClassement MOUNTED - user:', user.name);  // ← Debug 1: Composant monte-t-il ?

  const [classement, setClassement] = useState<ClassementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🚀 useEffect triggered - fetching classement');  // ← Debug 2: Fetch lance-t-il ?
    const fetchClassement = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/classement`, { 
          credentials: 'include',
          cache: 'no-store'  // Anti-cache
        });
        console.log('📡 Response status:', res.status, res.ok);  // ← Debug 3: 200 ?
        if (!res.ok) throw new Error(`HTTP ${res.status}: Impossible de charger le classement.`);
        const data = await res.json();
        console.log('📦 Raw data from API:', data, 'Type:', Array.isArray(data) ? 'Array' : typeof data);  // ← Debug 4: Array ou error ?
        if (data.error) throw new Error(data.error);
        if (!Array.isArray(data)) throw new Error('Données invalides (pas un array).');
        
        // ← Parse si strings (comme notes)
        const parsedClassement = data.map((entry: any, idx: number) => ({
          ...entry,
          rank: Number(entry.rank) || idx + 1,
          score: Number(entry.score) || 0,
          xp: Number(entry.xp) || 0,
          badges: Array.isArray(entry.badges) ? entry.badges : (entry.badges ? entry.badges.split(', ').filter(Boolean) : [])
        }));
        console.log('✅ Parsed classement length:', parsedClassement.length);  // ← Debug 5
        
        setClassement(parsedClassement);
      } catch (err: any) {
        console.error('❌ Fetch error full:', err);  // ← Log détaillé
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('🏁 Loading set to false');
      }
    };
    fetchClassement();
  }, []);  // Re-run si [user.id] pour refresh

  console.log('🎨 Rendering - loading:', loading, 'error:', error, 'classement len:', classement.length);  // ← Debug 6: Avant return

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-64">  {/* min-h pour éviter blanc */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mr-2"></div>
        <span className="text-gray-600">Chargement du classement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-100 text-red-800 rounded-lg shadow-md text-center min-h-64">
        <p className="font-semibold mb-2">Erreur : {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6 min-h-64">  {/* min-h anti-blanc */}
      <h1 className="text-4xl font-bold text-slate-800">Classement Général</h1>
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        {classement.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun score enregistré pour l'instant.</p>
            <p className="text-sm mt-2">Passez des quiz pour grimper au classement !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-full">
              <thead className="bg-gray-100 text-sm text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-lg">Rang</th>
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3 text-right">Score Total</th>
                  <th className="p-3 text-right">XP</th>
                  <th className="p-3 rounded-r-lg">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classement.map((u: ClassementEntry) => (  // ← Explicit type pour safety
                  <tr key={u.rank} className={`hover:bg-gray-50 ${u.name === user.name ? 'bg-green-50' : ''}`}>
                    <td className="p-3">
                      <span className={`font-bold text-lg ${
                        u.rank <= 3 ? 'text-yellow-500' : 'text-green-700'
                      }`}>
                        #{u.rank}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{u.name || 'Anonyme'}</td>
                    <td className="p-3 text-right font-medium">{u.score}</td>
                    <td className="p-3 text-right font-medium">{u.xp}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {u.badges && u.badges.length > 0 ? (
                          u.badges.map((b: string) => (
                            <span 
                              key={b} 
                              className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full"
                            >
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">Aucun badge</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
                                                                  }
