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
        {/* ASIDE SUPPRIMÉ : plus de barre latérale vide */}
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
