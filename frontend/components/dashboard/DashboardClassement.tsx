import React, { useEffect, useState } from 'react';
import { User, ClassementEntry } from '../../types';  // Assure-toi que ClassementEntry = { rank: number; name: string; score: number; xp: number; badges: string[]; }

interface DashboardClassementProps {
  user: User;
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function DashboardClassement({ user }: DashboardClassementProps) {
  const [classement, setClassement] = useState<ClassementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('DashboardClassement mounted, fetching...');  // ← Debug : confirme si composant monte
    const fetchClassement = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/classement`, { 
          credentials: 'include',
          cache: 'no-store'  // ← Ajout : anti-cache comme dans App.tsx
        });
        console.log('Classement response status:', res.status);  // ← Debug : check si 200
        if (!res.ok) throw new Error(`HTTP ${res.status}: Impossible de charger le classement.`);
        const data = await res.json();
        console.log('Classement data raw:', data);  // ← Debug clé : check array ou error
        if (data.error) throw new Error(data.error);
        if (!Array.isArray(data)) throw new Error('Données invalides du serveur.');
        setClassement(data);
      } catch (err: any) {
        console.error('Classement fetch error:', err);  // ← Log full error
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClassement();
  }, []);  // [] OK, re-fetch si besoin via user.id

  if (loading) {
    console.log('Showing loading...');  // ← Debug
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <span className="ml-2">Chargement du classement...</span>  // ← Texte pour confirmer
      </div>
    );
  }

  if (error) {
    console.log('Showing error:', error);  // ← Debug
    return (
      <div className="p-8 bg-red-100 text-red-800 rounded-lg shadow-md text-center">
        <p className="font-semibold mb-2">Erreur : {error}</p>
        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Réessayer
        </button>
      </div>
    );
  }

  console.log('Rendering classement, length:', classement.length);  // ← Debug : si 0, table vide mais headers visibles

  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold text-slate-800">Classement Général</h1>
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        {classement.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucun score enregistré pour l'instant. Commencez par passer des quiz !</div>  // ← Gère empty sans blanc
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-sm text-gray-600 uppercase">
                <tr>
                  <th className="p-3 rounded-l-lg">Rang</th>
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3 text-right">Score Total</th>
                  <th className="p-3 text-right">XP</th>
                  <th className="p-3 rounded-r-lg">Badges</th>
                </tr>
              </thead>
              <tbody>
                {classement.map(u => (
                  <tr key={u.rank} className={`border-b ${u.name === user.name ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                    <td className="p-3">
                      <span className={`font-bold text-lg ${u.rank <= 3 ? 'text-yellow-500' : 'text-green-700'}`}>#{u.rank}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{u.name || 'Anonyme'}</td>  // ← Fallback si name null
                    <td className="p-3 text-right">{u.score || 0}</td>  // ← Fallback
                    <td className="p-3 text-right">{u.xp || 0}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(u.badges) && u.badges.length > 0 ? (
                          u.badges.map(b => 
                            <span key={b} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {b}
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400 text-xs">Aucun</span>
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
