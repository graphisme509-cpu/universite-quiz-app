import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
import QuizDetail from './components/QuizDetail';
import NewAdmin from './components/dashboard/NewAdmin';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

  useEffect(() => {
  const checkSession = async () => {
    try {
      let res = await fetch(`${API_BASE_URL}/api/auth/session`, { credentials: 'include', cache: 'no-store' });

      // Si 401 to token expiré, on tente de rafraîchir
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

  const isDashboardPath = location.pathname.startsWith('/dashboard') || location.pathname === '/resultats';

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
          <div className="flex flex-col">
            <Link 
              to={user ? "/dashboard" : "/"} 
              className="text-2xl font-bold text-green-700 hover:text-green-800 transition-colors"
            >
              ENIJE
            </Link>
            <span className="text-xs text-gray-600 -mt-1">École Normale d'Instituteurs et de Jardinières d'Enfants</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-base">
            <Link className="hover:text-green-600 transition-colors" to="/">Accueil</Link>
            <Link className="hover:text-green-600 transition-colors" to="/quiz">Quiz</Link>
            {user && <Link className="hover:text-green-600 transition-colors" to="/dashboard">Dashboard</Link>}
          </nav>
          <div className="flex items-center space-x-2">
            {user ? (
               <div className="relative">
                    <button 
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                    >
                        <span>{user.name}</span>
                        <span className="flex items-center justify-center w-6 h-6 bg-green-600 rounded-full">
                          <svg className={`w-3 h-3 text-white transform transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </span>
                    </button>
                    <div className={`absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-20 border border-gray-100 ${menuOpen ? 'block' : 'hidden'}`}>
                        <Link 
                          to="/dashboard/" 
                          className={`block px-4 py-2.5 text-sm font-medium transition-colors ${location.pathname === '/dashboard/' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          Quiz
                        </Link>
                        <Link 
                          to="/dashboard/progression" 
                          className={`block px-4 py-2.5 text-sm font-medium transition-colors ${location.pathname === '/dashboard/progression' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          Progression
                        </Link>
                        <Link 
                          to="/resultats" 
                          className={`block px-4 py-2.5 text-sm font-medium transition-colors ${location.pathname === '/resultats' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          Résultats
                        </Link>
                        <Link 
                          to="/dashboard/classement" 
                          className={`block px-4 py-2.5 text-sm font-medium transition-colors ${location.pathname === '/dashboard/classement' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          Classement
                        </Link>
                        <Link 
 to="/dashboard/newadmin" 
 className={`block px-4 py-2.5 text-sm font-medium transition-colors ${location.pathname === '/dashboard/newadmin' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-100'}`}
>
 Administration
</Link>
                      <hr className="my-1 border-gray-200" />
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          Déconnexion
                        </button>
                    </div>
               </div>
            ) : (
              <>
                <Link to="/connexion" className="bg-green-600 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700 transition-shadow shadow-sm hover:shadow-md">Connexion</Link>
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
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/resultats" element={<Resultats user={user} />} />
          <Route path="/dashboard/*" element={<Dashboard user={user} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/termes" element={<Termes />} />
          <Route path="/politique" element={<Politique />} />
          <Route path="/dashboard/newadmin" element={<NewAdmin />} />
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
