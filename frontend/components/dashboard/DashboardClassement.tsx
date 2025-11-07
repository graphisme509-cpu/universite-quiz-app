import React, { useEffect, useState } from 'react';
import { User, ClassementEntry } from '../../types';

interface DashboardClassementProps {
  user: User;
}

interface UserQuizScore {
  quizName: string;
  score: number;
}

interface UserDetails {
  id: number;
  name: string;
  rank: number;
  totalScore: number;
  xp: number;
  badges: string[];
  quizScores: UserQuizScore[];
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function DashboardClassement({ user }: DashboardClassementProps) {
  const [classement, setClassement] = useState<ClassementEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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
          id: entry.id, // Ajout de l'ID pour les détails
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

  const fetchUserDetails = async (userId: number, rank: number, totalScore: number) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/user-details/${userId}`, { 
        credentials: 'include',
        cache: 'no-store'
      });
      if (!res.ok) throw new Error(`Erreur lors du chargement des détails.`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setSelectedUser({
        id: userId,
        name: data.name,
        rank,
        totalScore,
        xp: data.xp,
        badges: Array.isArray(data.badges) ? data.badges : (data.badges ? data.badges.split(', ').filter(Boolean) : []),
        quizScores: data.quizScores || []
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (entry: ClassementEntry) => {
    fetchUserDetails(entry.id, entry.rank, entry.score);
  };

  const handleBackToClassement = () => {
    setSelectedUser(null);
  };

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

  if (selectedUser) {
    return (
      <section className="w-full min-h-64">
        {/* Carte détaillée utilisateur */}
        <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-2xl shadow-xl border border-green-200 overflow-hidden max-w-4xl mx-auto">
          {/* Header avec Rang, Utilisateur, Badges */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className={`absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full ${selectedUser.rank <= 3 ? 'shadow-lg' : ''}`}>
                    #{selectedUser.rank}
                  </span>
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{selectedUser.name}</h2>
                  <p className="text-green-100 opacity-90">Score total : {selectedUser.totalScore} points</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedUser.badges.length > 0 ? (
                  selectedUser.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full border border-white/30"
                    >
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="text-green-100 opacity-70 italic text-sm">Aucun badge</span>
                )}
              </div>
            </div>
          </div>

          {/* Section Scores par Quiz */}
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Scores par Quiz
            </h3>
            {detailsLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              </div>
            ) : selectedUser.quizScores.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <p>Aucun quiz passé pour le moment.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {selectedUser.quizScores.map((quiz, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-2 truncate">{quiz.quizName}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="font-bold text-green-600 text-lg">{quiz.score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((quiz.score / 10) * 100, 100)}%` }} // Assumer max 10 par quiz
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer avec bouton retour */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <button
              onClick={handleBackToClassement}
              className="mx-auto flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au Classement
            </button>
          </div>
        </div>
      </section>
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
                    key={u.id} // Utilise l'ID comme clé
                    onClick={() => handleUserClick(u)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors border-2 ${
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
