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
          fetch('https://universite-quiz-app-production.up.railway.app/api/dashboard/stats', { credentials: 'include' }).then(r => r.json()),
          fetch('https://universite-quiz-app-production.up.railway.app/api/dashboard/classement', { credentials: 'include' }).then(r => r.json()),
          fetch('https://universite-quiz-app-production.up.railway.app/api/dashboard/progression', { credentials: 'include' }).then(r => r.json()),
          fetch('https://universite-quiz-app-production.up.railway.app/api/dashboard/quizzes', { credentials: 'include' }).then(r => r.json())
        ]);
        if (statsRes.error || classRes.error || progRes.error || quizRes.error) {
            throw new Error('Une des requêtes a échoué.');
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
    return <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-xl">Veuillez vous <Link to="/connexion" className="text-blue-600 hover:underline">connecter</Link> pour accéder au dashboard.</p>
    </div>;
  }
  
  if (loading) return <div className="text-center p-8"><p>Chargement du dashboard...</p></div>;
  if (error) return <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg shadow-md"><p>{error}</p></div>;

  const statsChartData = {
    labels: data.stats.monthlyLabels || [],
    datasets: [{ label: 'Score Moyen Mensuel', data: data.stats.monthlyScores || [], borderColor: '#3182ce', backgroundColor: 'rgba(49, 130, 206, 0.2)', fill: true, tension: 0.3 }]
  };

  const progressChartData = {
    labels: data.progression.matiereLabels || [],
    datasets: [{ data: data.progression.matiereScores || [], backgroundColor: ['#38a169', '#e53e3e', '#3182ce', '#dd6b20', '#d53f8c'], hoverOffset: 4 }]
  };

  const NavButton = ({ section, children }: { section: ActiveSection, children: React.ReactNode }) => (
    <button onClick={() => setActiveSection(section)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeSection === section ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}>
        {children}
    </button>
  );

  return (
    <main className="space-y-6">
      <h1 className="text-4xl font-bold">Dashboard de {user.name}</h1>
      <nav className="flex flex-wrap gap-2 p-2 bg-gray-200 rounded-lg">
        {/* FIX: Added children to NavButton components to provide text labels. */}
        <NavButton section="stats">Statistiques</NavButton>
        <NavButton section="classement">Classement</NavButton>
        <NavButton section="progression">Ma Progression</NavButton>
        <NavButton section="gestion-quiz">Gestion des Quiz</NavButton>
      </nav>

      <div className="p-6 bg-white rounded-lg shadow-md">
        {activeSection === 'stats' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Statistiques Générales</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-gray-100 rounded-lg shadow"><h3 className="text-3xl font-bold text-blue-600">{data.stats.totalUsers ?? 0}</h3><p>Utilisateurs</p></div>
              <div className="p-4 bg-gray-100 rounded-lg shadow"><h3 className="text-3xl font-bold text-blue-600">{data.stats.totalQuiz ?? 0}</h3><p>Quiz</p></div>
              <div className="p-4 bg-gray-100 rounded-lg shadow"><h3 className="text-3xl font-bold text-blue-600">{data.stats.totalScores ?? 0}</h3><p>Scores Enregistrés</p></div>
              <div className="p-4 bg-gray-100 rounded-lg shadow"><h3 className="text-3xl font-bold text-blue-600">{data.stats.avgTime ?? 0}s</h3><p>Temps Moyen</p></div>
            </div>
            <div><Line data={statsChartData} /></div>
          </section>
        )}
        {activeSection === 'classement' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Classement des Joueurs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100"><tr><th className="p-3">Rang</th><th className="p-3">Utilisateur</th><th className="p-3">Score Total</th><th className="p-3">XP</th><th className="p-3">Badges</th></tr></thead>
                <tbody>{data.classement.map(u => <tr key={u.rank} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-bold">{u.rank}</td><td className="p-3">{u.name}</td><td className="p-3">{u.score}</td><td className="p-3">{u.xp}</td><td className="p-3">{u.badges.join(', ') || 'Aucun'}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>
        )}
        {activeSection === 'progression' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Ma Progression</h2>
            <div>
                <p className="font-semibold text-lg">{data.progression.levelName} - Niveau {data.progression.level}</p>
                <p>{data.progression.xp} XP</p>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2"><div className="bg-green-500 h-4 rounded-full" style={{width: `${(data.progression.xp ?? 0) % 100}%`}}></div></div>
            </div>
            <div>
                <h3 className="text-xl font-semibold">Mes Badges</h3>
                <ul className="flex flex-wrap gap-2 mt-2">{data.progression.badges?.length ? data.progression.badges.map(b => <li key={b} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">{b}</li>) : <p>Aucun badge pour le moment.</p>}</ul>
            </div>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-2">Scores moyens par matière</h3>
                <Doughnut data={progressChartData} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Feedback Récent</h3>
                 <ul className="space-y-2 mt-2">{data.progression.feedbacks?.map((f, i) => <div key={i} className="p-2 border rounded-lg"><strong>{f.question}:</strong> {f.correct ? 'Correct' : 'Incorrect'}. {f.explanation}</div>)}</ul>
              </div>
            </div>
          </section>
        )}
        {activeSection === 'gestion-quiz' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Gestion de mes Quiz</h2>
            <div className="space-y-4">
            {data.quizzes.map(q => (
              <div key={q.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold">{q.name}</h4>
                  <p className="text-sm text-gray-600">{q.matiere} - {q.questions_count} questions</p>
                </div>
                <div>
                  <button className="text-blue-600 hover:underline mr-2">Modifier</button>
                  <button className="text-red-600 hover:underline">Supprimer</button>
                </div>
              </div>
            ))}
             <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Créer un nouveau Quiz</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
