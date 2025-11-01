import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

interface ConnexionProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';


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
      const res = await fetch(`${API_BASE_URL}/api/auth/connexion`, {
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
        setMessage(data.message || 'Email ou mot de passe incorrect.');
      }
    } catch (err) {
      setMessage('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8">
        <section className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6">Connexion</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" placeholder="vous@exemple.com" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <div className="relative">
                    <input type={showPass ? 'text' : 'password'} name="motdepasse" placeholder="••••••••" value={formData.motdepasse} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                       {showPass ? '🙈' : '👁️'}
                    </button>
                </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-wait">
            {loading ? 'Connexion...' : 'Se connecter'}
            </button>
        </form>
        {message && <p className="mt-4 p-3 rounded-lg text-center bg-red-100 text-red-800">{message}</p>}
        </section>
    </div>
  );
}
