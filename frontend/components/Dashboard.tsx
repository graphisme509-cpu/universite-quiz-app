import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import DashboardAccueil from './dashboard/DashboardAccueil';
import DashboardProgression from './dashboard/DashboardProgression';
import DashboardResultats from './dashboard/DashboardResultats';
import DashboardClassement from './dashboard/DashboardClassement';
import HomeIcon from './icons/HomeIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import TrophyIcon from './icons/TrophyIcon';

interface DashboardProps {
  user: User | null;
}

type NavLinkProps = {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
};

const NavLink = ({ to, icon, children }: NavLinkProps) => {
    const location = useLocation();
    const isActive = location.pathname === `/dashboard${to}`;
    return (
        <Link to={to} className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-base ${isActive ? 'bg-green-600 text-white font-semibold shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
            {icon}
            <span>{children}</span>
        </Link>
    );
};

// --- NOUVEAU : DashboardAccueil modifié avec spinner ---
const DashboardAccueil = ({ user }: { user: User }) => {
  const [startingQuiz, setStartingQuiz] = React.useState(false);
  const [selectedQuiz, setSelectedQuiz] = React.useState<string | null>(null);

  const handleStartQuiz = (quizName: string) => {
    setSelectedQuiz(quizName);
    setStartingQuiz(true);
    // Simuler un délai (remplace par ton vrai appel API ou navigation)
    setTimeout(() => {
      window.location.href = `/quiz/${quizName}`;
    }, 800);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold text-slate-800">Bienvenue sur votre espace</h1>
      <p className="mt-6 text-lg text-gray-700">Choisissez un quiz pour commencer à apprendre.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exemple de quiz - remplace par ton vrai mapping */}
        {['Maths', 'Histoire', 'Santé Animale'].map((quiz) => (
          <div key={quiz} className="border rounded-lg p-4 hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{quiz}</h3>
            <button
              onClick={() => handleStartQuiz(quiz)}
              disabled={startingQuiz}
              className={`mt-3 w-full py-2 rounded-lg text-white font-medium transition ${
                startingQuiz && selectedQuiz === quiz
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {startingQuiz && selectedQuiz === quiz ? (
                <div className="flex justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                'Commencer le quiz'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
// ---

export default function Dashboard({ user }: DashboardProps) {
  if (!user) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
        <p className="text-xl">
          Veuillez vous <Link to="/connexion" className="text-green-600 hover:underline font-semibold">connecter</Link> pour accéder à votre dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
            <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200 sticky top-24">
                {/* MENU SUPPRIMÉ ICI (celui de la page, pas du header) */}
            </div>
        </aside>
        <main className="flex-grow">
            <Routes>
                <Route index element={<DashboardAccueil user={user}/>} />
                <Route path="progression" element={<DashboardProgression user={user}/>} />
                <Route path="resultats" element={<DashboardResultats user={user}/>} />
                <Route path="classement" element={<DashboardClassement user={user}/>} />
            </Routes>
        </main>
    </div>
  );
                      }
