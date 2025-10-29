import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { User, ProgressionData } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

interface DashboardProgressionProps {
  user: User;
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';


export default function DashboardProgression({ user }: DashboardProgressionProps) {
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/progression`, { credentials: 'include' });
        if (!res.ok) throw new Error("Impossible de charger les données de progression.");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setProgression(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgression();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );
  if (error) return <div className="p-8 bg-red-100 text-red-800 rounded-lg shadow-md text-center"><p>{error}</p></div>;
  if (!progression) return <div className="p-8 bg-white rounded-lg shadow-md text-center"><p>Aucune donnée de progression disponible.</p></div>;

  const progressChartData = {
    labels: progression.matiereLabels || [],
    datasets: [{ 
        data: progression.matiereScores || [], 
        backgroundColor: ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'],
        hoverOffset: 4,
        borderWidth: 0,
    }]
  };

  const xpPercentage = (progression.xp ?? 0) % 100;

  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold text-slate-800">Ma Progression</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4">
            <div>
                <p className="text-lg font-semibold text-slate-800">{progression.levelName} - Niveau {progression.level}</p>
                <p className="text-gray-600 font-bold text-green-600">{progression.xp} XP</p>
            </div>
            <div>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                    <span>Progression vers le niveau { (progression.level ?? 0) + 1}</span>
                    <span>{xpPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-500 h-4 rounded-full" style={{width: `${xpPercentage}%`}}></div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700">Mes Badges</h3>
                <ul className="flex flex-wrap gap-2 mt-2">
                    {progression.badges?.length ? progression.badges.map(b => 
                        <li key={b} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">{b}</li>
                    ) : <p className="text-gray-500 text-sm">Aucun badge pour le moment.</p>}
                </ul>
            </div>
        </div>
        
        <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-slate-700">Scores moyens par matière</h3>
            <div className="max-w-sm mx-auto">
                <Doughnut data={progressChartData} />
            </div>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Feedback sur vos dernières réponses</h3>
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {progression.feedbacks?.length ? progression.feedbacks.map((f, i) => 
                <li key={i} className="p-3 border rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-800">{f.question}</p>
                    <p className="text-sm">
                        <span className={`font-bold ${f.correct ? 'text-green-600' : 'text-red-600'}`}>{f.correct ? 'Correct' : 'Incorrect'}.</span> 
                        <span className="text-gray-600"> {f.explanation}</span>
                    </p>
                </li>
            ) : <p className="text-gray-500 text-center py-4">Aucun feedback récent.</p>}
        </ul>
      </div>
    </section>
  );
}
