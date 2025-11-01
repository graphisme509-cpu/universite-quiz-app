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
        {/* MENU DE LA PAGE SUPPRIMÉ (pas le header sidebar) */}
        <aside className="md:w-64 flex-shrink-0">
            <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200 sticky top-24">
                {/* Tout le contenu du menu a été retiré */}
            </div>
        </aside>

        <main className="flex-grow">
            <Routes>
                <Route index element={<DashboardAccueil user={user} />} />
                <Route path="progression" element={<DashboardProgression user={user} />} />
                <Route path="resultats" element={<DashboardResultats user={user} />} />
                <Route path="classement" element={<DashboardClassement user={user} />} />
            </Routes>
        </main>
    </div>
  );
}
