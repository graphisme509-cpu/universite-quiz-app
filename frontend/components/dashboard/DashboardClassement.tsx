import React, { useEffect, useState } from 'react';
import { User, ClassementEntry } from '../../types';

interface DashboardClassementProps {
  user: User;
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';


export default function DashboardClassement({ user }: DashboardClassementProps) {
  const [classement, setClassement] = useState<ClassementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassement = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/classement`, { credentials: 'include' });
        if (!res.ok) throw new Error("Impossible de charger le classement.");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setClassement(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClassement();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );
  if (error) return <div className="p-8 bg-red-100 text-red-800 rounded-lg shadow-md text-center"><p>{error}</p></div>;

  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold text-slate-800">Classement Général</h1>
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
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
                  <td className="p-3 font-semibold text-slate-800">{u.name}</td>
                  <td className="p-3 text-right">{u.score}</td>
                  <td className="p-3 text-right">{u.xp}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.badges.length > 0 ? u.badges.map(b => 
                          <span key={b} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">{b}</span>
                      ) : <span className="text-gray-400 text-xs">Aucun</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
