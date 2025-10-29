
import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Accueil from './components/Accueil';
import Connexion from './components/Connexion';
import Inscription from './components/Inscription';
import Quiz from './components/Quiz';
import Resultats from './components/Resultats';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
import Termes from './components/Termes';
import Politique from './components/Politique';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div className="app min-h-screen flex flex-col font-sans text-slate-800">
      <header className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:text-blue-300 transition-colors">Université Quiz</Link>
          <nav className="flex items-center space-x-4 text-lg">
            <Link className="hover:text-blue-300 transition-colors" to="/">Accueil</Link>
            {!user && <Link className="hover:text-blue-300 transition-colors" to="/inscription">Inscription</Link>}
            {!user && <Link className="hover:text-blue-300 transition-colors" to="/connexion">Connexion</Link>}
            {user && <Link className="hover:text-blue-300 transition-colors" to="/quiz">Quiz</Link>}
            {user && <Link className="hover:text-blue-300 transition-colors" to="/resultats">Résultats</Link>}
            {user && <Link className="hover:text-blue-300 transition-colors" to="/dashboard">Dashboard</Link>}
            <Link className="hover:text-blue-300 transition-colors" to="/termes">Termes</Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/inscription" element={<Inscription setUser={setUser} />} />
          <Route path="/connexion" element={<Connexion setUser={setUser} />} />
          <Route path="/quiz" element={<Quiz user={user} />} />
          <Route path="/resultats" element={<Resultats user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/termes" element={<Termes />} />
          <Route path="/politique" element={<Politique />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
