import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard({ user }) {
  if (!user) return <p>Connectez-vous.</p>;
  const [data, setData] = useState({ stats: {}, classement: [], progression: {}, quizzes: [] });
  const [activeSection, setActiveSection] = useState('stats');

  useEffect(() => {
    const loadData = async () => {
      const [statsRes, classRes, progRes, quizRes] = await Promise.all([
        fetch('universite-quiz-app-production.up.railway.app/api/dashboard/stats', { credentials: 'include' }).then(r => r.json()),
        fetch('universite-quiz-app-production.up.railway.app/api/dashboard/classement', { credentials: 'include' }).then(r => r.json()),
        fetch('universite-quiz-app-production.up.railway.app/api/dashboard/progression', { credentials: 'include' }).then(r => r.json()),
        fetch('universite-quiz-app-production.up.railway.app/api/dashboard/quizzes', { credentials: 'include' }).then(r => r.json())
      ]);
      setData({ stats: statsRes, classement: classRes, progression: progRes, quizzes: quizRes });
    };
    loadData();
  }, []);

  const statsChartData = {
    labels: data.stats.monthlyLabels || [],
    datasets: [{ label: 'Scores', data: data.stats.monthlyScores || [], borderColor: '#3182ce' }]
  };

  const progressChartData = {
    labels: data.progression.matiereLabels || [],
    datasets: [{ data: data.progression.matiereScores || [], backgroundColor: ['#38a169', '#e53e3e', '#3182ce'] }]
  };

  return (
    <main>
      <nav>
        <button onClick={() => setActiveSection('stats')}>Stats</button>
        <button onClick={() => setActiveSection('classement')}>Classement</button>
        <button onClick={() => setActiveSection('progression')}>Progression</button>
        <button onClick={() => setActiveSection('gestion-quiz')}>Gestion Quiz</button>
      </nav>
      {activeSection === 'stats' && (
        <section>
          <div className="stats-grid">
            <div><h3>{data.stats.totalUsers}</h3><p>Users</p></div>
            <div><h3>{data.stats.totalQuiz}</h3><p>Quiz</p></div>
            <div><h3>{data.stats.totalScores}</h3><p>Scores</p></div>
            <div><h3>{data.stats.avgTime}s</h3><p>Temps Moy.</p></div>
          </div>
          <Line data={statsChartData} />
        </section>
      )}
      {activeSection === 'classement' && (
        <table>
          <thead><tr><th>Rang</th><th>User</th><th>Score</th><th>XP</th><th>Badges</th></tr></thead>
          <tbody>{data.classement.map((u, i) => <tr key={i}><td>{u.rank}</td><td>{u.name}</td><td>{u.score}</td><td>{u.xp}</td><td>{u.badges.join(', ')}</td></tr>)}</tbody>
        </table>
      )}
      {activeSection === 'progression' && (
        <div>
          <div style={{width: `${data.progression.xp % 100}%`}} className="level-bar"></div>
          <p>{data.progression.levelName}</p>
          <ul>{data.progression.badges.map(b => <li key={b}>{b}</li>)}</ul>
          <Doughnut data={progressChartData} />
        </div>
      )}
      {activeSection === 'gestion-quiz' && (
        <div>
          {data.quizzes.map(q => (
            <div key={q.id}>
              <h4>{q.name}</h4>
              <p>{q.matiere} - {q.questions.length} questions</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
                                                         }
