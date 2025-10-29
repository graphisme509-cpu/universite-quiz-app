import React, { useState } from 'react';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [formData, setFormData] = useState({ code: '', math: '', physique: '', info: '', moyenne: '' });
  const [loginCode, setLoginCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('https://universite-quiz-app-production.up.railway.app/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: loginCode })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setMessage('Connexion admin réussie !');
      } else {
        setMessage(data.message || 'Code admin invalide.');
      }
    } catch (err) {
      setMessage('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
        setMessage('Non authentifié. Veuillez vous reconnecter.');
        setIsLoggedIn(false);
        return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/save-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Notes sauvegardées avec succès !');
        setFormData({ code: '', math: '', physique: '', info: '', moyenne: '' });
      } else {
        setMessage(data.message || 'Erreur lors de la sauvegarde.');
        if (data.code === 'INVALID_TOKEN') {
            handleLogout();
        }
      }
    } catch (err) {
      setMessage('Erreur réseau lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsLoggedIn(false);
    setMessage('');
  };

  if (!isLoggedIn) {
    return (
      <section className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border">
        <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">Accès Administrateur</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" placeholder="Code d'accès Admin" value={loginCode} onChange={(e) => setLoginCode(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
          <button type="submit" disabled={loading} className="w-full bg-slate-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors disabled:bg-gray-400">
            {loading ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>
        {message && <p className={`mt-4 p-3 rounded-lg text-center ${message.includes('réussie') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
      </section>
    );
  }

  return (
    <section className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Admin - Gestion des Notes</h2>
        <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Déconnexion</button>
      </div>
      <form onSubmit={handleSaveNotes} className="space-y-4">
        <input type="text" name="code" placeholder="Code Étudiant" value={formData.code} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" name="math" step="0.01" min="0" max="20" placeholder="Note Mathématiques" value={formData.math} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
            <input type="number" name="physique" step="0.01" min="0" max="20" placeholder="Note Physique" value={formData.physique} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
            <input type="number" name="info" step="0.01" min="0" max="20" placeholder="Note Informatique" value={formData.info} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
            <input type="number" name="moyenne" step="0.01" min="0" max="20" placeholder="Moyenne (auto si vide)" value={formData.moyenne} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
          {loading ? 'Sauvegarde...' : 'Sauvegarder les notes'}
        </button>
      </form>
      {message && <p className={`mt-4 p-3 rounded-lg text-center ${message.includes('succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
    </section>
  );
}
