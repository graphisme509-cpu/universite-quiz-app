import React, { useEffect, useState } from 'react';
import { User, ClassementEntry } from '../../types';

interface DashboardClassementProps {
  user: User;
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function DashboardClassement({ user }: DashboardClassementProps) {
  const [classement, setClassement] = useState<ClassementEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassement = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/classement`, { 
          credentials: 'include',
          cache: 'no-store'
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: Impossible de charger le classement.`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!Array.isArray(data)) throw new Error('Données invalides (pas un array).');
        
        const parsedClassement = data.map((entry: any, idx: number) => ({
          ...entry,
          rank: Number(entry.rank) || idx + 1,
          score: Number(entry.score) || 0,
          xp: Number(entry.xp) || 0,
          badges: Array.isArray(entry.badges)
            ? entry.badges
            : (entry.badges ? entry.badges.split(', ').filter(Boolean) : [])
        }));
        
        setClassement(parsedClassement);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClassement();
  }, []);

  const filteredClassement = classement.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordre de supériorité des badges (du plus bas au plus haut)
  const badgeOrder = ['Débutant', 'Amateur', 'Pro', 'Expert', 'Maître'];

  // Fonction pour trouver le badge le plus élevé
  const getHighestBadge = (badges: string[]) => {
    for (let i = badgeOrder.length - 1; i >= 0; i--) {
      if (badges.includes(badgeOrder[i])) {
        return badgeOrder[i];
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-64">
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
    <section className="w-full space-y-4 min-h-64">
      <h1 className="text-3xl font-bold text-slate-800 whitespace-nowrap text-center">
        Classement général
      </h1>

      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {filteredClassement.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>Aucun score enregistré pour l'instant.</p>
          <p className="text-sm mt-2">Passez des quiz pour grimper au classement !</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="w-full min-w-full text-center border-separate border-spacing-0">
            <thead className="bg-gray-50 border-b border-gray-200 text-center">
              <tr>
                <th className="p-1 font-semibold text-gray-700 rounded-l-lg text-center">Rang</th>
                <th className="px-1 py-1 font-semibold text-gray-700 text-center">Utilisateur</th>
                <th className="px-1 py-1 font-semibold text-gray-700 text-center">Score</th>
                <th className="p-1 font-semibold text-gray-700 rounded-r-lg text-center">Badge</th>
              </tr>
            </thead>

            <tbody className="align-middle text-center">
              {filteredClassement.map((u: ClassementEntry) => {
                const isCurrentUser = u.name === user.name;
                const highestBadge = getHighestBadge(u.badges);
                return (
                  <tr
                    key={u.rank}
                    className={`hover:bg-gray-50 transition-colors border-2 ${
                      isCurrentUser ? 'bg-green-100 border-green-400' : 'border-transparent divide-y divide-gray-100'
                    }`}
                  >
                    <td className="p-1 align-middle text-center">
                      <span className={`font-bold text-lg ${u.rank <= 3 ? 'text-yellow-500' : 'text-green-700'}`}>
                        #{u.rank}
                      </span>
                    </td>

                    <td className="px-1 py-1 font-semibold text-slate-800 align-middle text-center">
                      {u.name || 'Anonyme'}
                    </td>

                    <td className="px-1 py-1 font-medium text-slate-900 align-middle text-center">
                      {u.score}
                    </td>

                    <td className="p-1 align-middle text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {highestBadge ? (
                          <span 
                            key={highestBadge} 
                            className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full"
                          >
                            {highestBadge}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Aucun badge</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
