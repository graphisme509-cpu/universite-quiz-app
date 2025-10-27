import { useState, useEffect } from 'react';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [formData, setFormData] = useState({ code: '', math: '', physique: '', info: '', moyenne: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('universite-quiz-app-production.up.railway.app/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.code })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setMessage('Login OK !');
        setFormData({ code: '', math: '', physique: '', info: '', moyenne: '' }); // Reset form
      } else setMessage(data.message);
    } catch (err) {
      setMessage('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!token) return setMessage('Non connecté.');
    setLoading(true);
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
        setMessage('Notes sauvées !');
        setFormData({ code: '', math: '', physique: '', info: '', moyenne: '' });
      } else setMessage(data.message);
    } catch (err) {
      setMessage('Erreur envoi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsLoggedIn(false);
    setMessage('');
  };

  if (!isLoggedIn) {
    return (
      <section>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Code Admin" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
          <button type="submit" disabled={loading}>{loading ? '...' : 'Login'}</button>
        </form>
        {message && <p className={message.includes('OK') ? 'success' : 'error'}>{message}</p>}
      </section>
    );
  }

  return (
    <section>
      <h2>Admin - Sauvegarder Notes</h2>
      <button onClick={handleLogout}>Logout</button>
      <form onSubmit={handleSaveNotes}>
        <input type="text" placeholder="Code Étudiant" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
        <input type="number" step="0.01" min="0" max="20" placeholder="Math" value={formData.math} onChange={(e) => setFormData({...formData, math: e.target.value})} required />
        <input type="number" step="0.01" min="0" max="20" placeholder="Physique" value={formData.physique} onChange={(e) => setFormData({...formData, physique: e.target.value})} required />
        <input type="number" step="0.01" min="0" max="20" placeholder="Info" value={formData.info} onChange={(e) => setFormData({...formData, info: e.target.value})} required />
        <input type="number" step="0.01" min="0" max="20" placeholder="Moyenne (auto si vide)" value={formData.moyenne} onChange={(e) => setFormData({...formData, moyenne: e.target.value})} />
        <button type="submit" disabled={loading}>{loading ? '...' : 'Sauvegarder'}</button>
      </form>
      {message && <p className={message.includes('sauvées') ? 'success' : 'error'}>{message}</p>}
    </section>
  );
        }
