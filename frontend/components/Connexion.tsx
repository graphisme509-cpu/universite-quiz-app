
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';

interface ConnexionProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export default function Connexion({ setUser }: ConnexionProps) {
  const [formData, setFormData] = useState({ email: '', motdepasse: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('https://universite-quiz-app-production.up.railway.app/api/auth/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setMessage('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6">Connexion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} name="motdepasse" placeholder="Mot de passe" value={formData.motdepasse} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
            👁️
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      {message && <p className="mt-4 p-3 rounded-lg text-center bg-red-100 text-red-800">{message}</p>}
      <p className="mt-6 text-center text-gray-600">
        Pas de compte ? <Link to="/inscription" className="text-blue-600 hover:underline">Inscrivez-vous</Link>
      </p>
    </section>
  );
}
