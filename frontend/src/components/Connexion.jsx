// Connexion.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Connexion({ setUser }) {
  const [formData, setFormData] = useState({ email: '', motdepasse: '' });
  const [message, setMessage] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('universite-quiz-app-production.up.railway.app/api/auth/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        navigate('/dashboard');
      } else setMessage(data.message);
    } catch (err) {
      setMessage('Erreur réseau.');
    }
  };

  return (
    <section>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input type={showPass ? 'text' : 'password'} placeholder="Mot de passe" value={formData.motdepasse} onChange={(e) => setFormData({...formData, motdepasse: e.target.value})} required />
        <button type="button" onClick={() => setShowPass(!showPass)}>👁️</button>
        <button type="submit">Se connecter</button>
      </form>
      {message && <p className="error">{message}</p>}
      <p><a href="/inscription">Pas de compte ?</a></p>
    </section>
  );
}
