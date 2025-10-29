import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Accueil from './components/Accueil';
import AccueilConnecte from './components/AccueilConnecte';
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

  useEffect(() => {
  const checkSession = async () => {
    try {
      let res = await fetch(`${API_BASE_URL}/api/auth/session`, { credentials: 'include', cache: 'no-store' });

      // Si 401 → token expiré, on tente de rafraîchir
      if (res.status === 401) {
        const refresh = await fetch(`${API_BASE_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (!refresh.ok) throw new Error('Session expirée, veuillez vous reconnecter.');
        res = await fetch(`${API_BASE_URL}/api/auth/session`, { credentials: 'include' });
      }

      if (!res.ok) throw new Error('Impossible de récupérer la session.');
      const data = await res.json();
      setUser(data.user);
    } catch (error: any) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkSession();
}, []);

  const handleLogout = async () => {
    try {
        await fetch(`${API_BASE_URL}/api/auth/deconnexion`, { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        setUser(null);
        navigate('/');
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600"></div>
        </div>
    );
  }

  return (
    <div className="app min-h-screen flex flex-col bg-gray-50 text-slate-800">
      <header className="bg-white text-slate-800 shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-700 hover:text-green-800 transition-colors">
            Université Quiz
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-base">
            <Link className="hover:text-green-600 transition-colors" to="/">Accueil</Link>
            <Link className="hover:text-green-600 transition-colors" to="/quiz">Quiz</Link>
            {user && <Link className="hover:text-green-600 transition-colors" to="/dashboard">Dashboard</Link>}
          </nav>
          <div className="flex items-center space-x-2">
            {user ? (
               <div className="relative group">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <span>{user.name}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon Dashboard</Link>
                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Déconnexion</button>
                    </div>
               </div>
            ) : (
              <>
                <Link to="/connexion" className="text-gray-600 hover:text-green-600 transition-colors px-4 py-2 rounded-md">Connexion</Link>
                <Link to="/inscription" className="bg-green-600 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700 transition-shadow shadow-sm hover:shadow-md">Inscription</Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={user ? <AccueilConnecte user={user}/> : <Accueil />} />
          <Route path="/inscription" element={<Inscription setUser={setUser} />} />
          <Route path="/connexion" element={<Connexion setUser={setUser} />} />
          <Route path="/quiz" element={<Quiz user={user} />} />
          <Route path="/quiz/:id" element={<QuizDetail user={user} />} />
          <Route path="/resultats" element={<Resultats user={user} />} />
          <Route path="/dashboard/*" element={<Dashboard user={user} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/termes" element={<Termes />} />
          <Route path="/politique" element={<Politique />} />
        </Routes>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto py-6 px-6 text-center text-gray-500">
            <div className="space-x-4 mb-2">
                <Link to="/termes" className="hover:underline hover:text-green-600">Termes d'Utilisation</Link>
                <span>|</span>
                <Link to="/politique" className="hover:underline hover:text-green-600">Politique de Confidentialité</Link>
            </div>
            <p>&copy; {new Date().getFullYear()} Université Quiz. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
