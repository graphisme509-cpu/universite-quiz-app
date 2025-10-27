import { Routes, Route, Link } from 'react-router-dom';
import Accueil from './components/Accueil.jsx';
import Connexion from './components/Connexion.jsx';
import Inscription from './components/Inscription.jsx';
import Quiz from './components/Quiz.jsx';
import Resultats from './components/Resultats.jsx';
import Dashboard from './components/Dashboard.jsx';
import Admin from './components/Admin.jsx';
import Termes from './components/Termes.jsx';
import Politique from './components/Politique.jsx';
import { useState } from 'react';

function App() {
  const [user, setUser] = useState(null);  // Auth state global
  return (
    <div className="app">
      <header className="global-header">
        <h1>Université Quiz</h1>
        <nav>
          <Link to="/">Accueil</Link>
          {!user && <Link to="/inscription">Inscription</Link>}
          {!user && <Link to="/connexion">Connexion</Link>}
          {user && <Link to="/quiz">Quiz</Link>}
          {user && <Link to="/resultats">Résultats</Link>}
          {user && <Link to="/dashboard">Dashboard</Link>}
          <Link to="/termes">Termes</Link>
          <Link to="/contact">Contact</Link>  {/* Intégré dans Accueil */}
        </nav>
      </header>
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
    </div>
  );
}

export default App;
