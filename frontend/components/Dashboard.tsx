import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { User, DashboardData } from '../types';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

interface DashboardProps {
  user: User | null;
}

type ActiveSection = 'stats' | 'classement' | 'progression' | 'gestion-quiz';

export default function Dashboard({ user }: DashboardProps) {
  const [data, setData] = useState<DashboardData>({ stats: {}, classement: [], progression: {}, quizzes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<ActiveSection>('stats');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, classRes, progRes, quizRes] = await Promise.all([
          fetch('/api/dashboard/stats', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/dashboard/classement', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/dashboard/progression', { credentials: 'include' }).then(r => r.json()),
          fetch('/api/dashboard/quizzes', { credentials: 'include' }).then(r => r.json())
        ]);
        if (statsRes.error || classRes.error || progRes.error || quizRes.error) {
            throw new Error('Une ou plusieurs requêtes de données ont échoué.');
        }
        setData({ stats: statsRes, classement: classRes, progression: progRes, quizzes: quizRes });
      } catch (err: any) {
        setError(err.message || 'Impossible de charger les données du dashboard.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        loadData();
    }
  }, [user]);

  if (!user) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
        <p className="text-xl">Veuillez vous <Link to="/connexion" className="text-green-600 hover:underline font-semibold">connecter</Link> pour accéder à votre dashboard.</p>
    </div>;
  }
  
  if (loading) return (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="ml-4 text-lg">Chargement du dashboard...</p>
    </div>
  );
  if (error) return <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg shadow-md"><p>{error}</p></div>;

  const statsChartData = {
    labels: data.stats.monthlyLabels || [],
    datasets: [{ 
        label: 'Score Moyen Mensuel', 
        data: data.stats.monthlyScores || [], 
        borderColor: '#16a34a', // green-600
        backgroundColor: 'rgba(22, 163, 74, 0.2)', 
        fill: true, 
        tension: 0.4 
    }]
  };

  const progressChartData = {
    labels: data.progression.matiereLabels || [],
    datasets: [{ 
        data: data.progression.matiereScores || [], 
        backgroundColor: ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'], // Shades of green
        hoverOffset: 4,
        borderWidth: 0,
    }]
  };
  
  // FIX: Extracted props into a type alias to fix TS error with children prop.
  type NavButtonProps = {
    section: ActiveSection;
    children: React.ReactNode;
  };
  
  const NavButton = ({ section, children }: NavButtonProps) => (
    <button onClick={() => setActiveSection(section)} className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm md:text-base ${activeSection === section ? 'bg-green-600 text-white shadow-md' : 'bg-white hover:bg-gray-100 text-gray-600'}`}>
        {children}
    </button>
  );

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-lg text-gray-500">Bienvenue, {user.name} !</p>
      </div>
      <nav className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-xl">
        <NavButton section="stats">Statistiques</NavButton>
        <NavButton section="classement">Classement</NavButton>
        <NavButton section="progression">Ma Progression</NavButton>
        <NavButton section="gestion-quiz">Gestion des Quiz</NavButton>
      </nav>

      <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        {activeSection === 'stats' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Statistiques Générales</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg border"><h3 className="text-3xl font-bold text-green-600">{data.stats.totalUsers ?? 0}</h3><p className="text-gray-500">Utilisateurs</p></div>
              <div className="p-4 bg-gray-50 rounded-lg border"><h3 className="text-3xl font-bold text-green-600">{data.stats.totalQuiz ?? 0}</h3><p className="text-gray-500">Quiz</p></div>
              <div className="p-4 bg-gray-50 rounded-lg border"><h3 className="text-3xl font-bold text-green-600">{data.stats.totalScores ?? 0}</h3><p className="text-gray-500">Scores</p></div>
              <div className="p-4 bg-gray-50 rounded-lg border"><h3 className="text-3xl font-bold text-green-600">{data.stats.avgTime ?? 0}s</h3><p className="text-gray-500">Temps Moyen</p></div>
            </div>
            <div><Line data={statsChartData} /></div>
          </section>
        )}
        {activeSection === 'classement' && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Classement des Joueurs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-sm text-gray-600 uppercase"><tr><th className="p-3">Rang</th><th className="p-3">Utilisateur</th><th className="p-3">Score Total</th><th className="p-3">XP</th><th className="p-3">Badges</th></tr></thead>
                <tbody>{data.classement.map(u => <tr key={u.rank} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-bold text-green-700">{u.rank}</td><td className="p-3 font-semibold">{u.name}</td><td className="p-3">{u.score}</td><td className="p-3">{u.xp}</td><td className="p-3">{u.badges.join(', ') || 'Aucun'}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>
        )}
        {activeSection === 'progression' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Ma Progression</h2>
            <div>
                <p className="font-semibold text-lg">{data.progression.levelName} - Niveau {data.progression.level}</p>
                <p className="text-gray-600">{data.progression.xp} XP</p>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2"><div className="bg-green-500 h-4 rounded-full" style={{width: `${(data.progression.xp ?? 0) % 100}%`}}></div></div>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-slate-700">Mes Badges</h3>
                <ul className="flex flex-wrap gap-2 mt-2">{data.progression.badges?.length ? data.progression.badges.map(b => <li key={b} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">{b}</li>) : <p className="text-gray-500">Aucun badge pour le moment.</p>}</ul>
            </div>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-slate-700">Scores moyens par matière</h3>
                <Doughnut data={progressChartData} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-700">Feedback Récent</h3>
                 <ul className="space-y-2 mt-2 max-h-60 overflow-y-auto">{data.progression.feedbacks?.length ? data.progression.feedbacks.map((f, i) => <div key={i} className="p-3 border rounded-lg bg-gray-50"><strong className="block text-gray-800">{f.question}</strong> <span className={`font-semibold ${f.correct ? 'text-green-600' : 'text-red-600'}`}>{f.correct ? 'Correct' : 'Incorrect'}.</span> <span className="text-gray-600">{f.explanation}</span></div>) : <p className="text-gray-500">Aucun feedback récent.</p>}</ul>
              </div>
            </div>
          </section>
        )}
        {activeSection === 'gestion-quiz' && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Gestion de mes Quiz</h2>
            <div className="space-y-4">
            {data.quizzes.map(q => (
              <div key={q.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                <div>
                  <h4 className="text-lg font-semibold">{q.name}</h4>
                  <p className="text-sm text-gray-600">{q.matiere} - {q.questions_count} questions</p>
                </div>
                <div className="space-x-2">
                  <button className="text-green-600 hover:underline font-semibold">Modifier</button>
                  <button className="text-red-600 hover:underline font-semibold">Supprimer</button>
                </div>
              </div>
            ))}
             <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold shadow-sm hover:shadow-md transition-all">Créer un nouveau Quiz</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}