
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface InscriptionProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Hook personnalisé pour la barre de force du mot de passe (basé sur les règles backend)
function usePasswordMeter() {
  const [strength, setStrength] = useState({ score: 0, issues: [] as string[], ok: false });
  const updatePasswordMeter = useCallback((pw: string, email?: string, name?: string) => {
    const issues: string[] = [];
    if (pw.length < 8) issues.push('8 caractères min.');
    if (!/[a-z]/.test(pw)) issues.push('Une minuscule.');
    if (!/[A-Z]/.test(pw)) issues.push('Une majuscule.');
    if (!/[0-9]/.test(pw)) issues.push('Un chiffre.');
    if (!/[^\w\s]/.test(pw)) issues.push('Un symbole.');
    
    const parts = [...(email ? email.split(/[@._-]/) : []), ...(name ? name.split(/\s+/) : [])]
        .map(s => s.toLowerCase()).filter(s => s.length >= 3);
    if (parts.some(p => pw.toLowerCase().includes(p))) issues.push('Ne doit pas contenir votre nom/email.');
    
    if (/0123|1234|abcd|qwerty|password/i.test(pw)) issues.push('Évitez les séquences évidentes.');
    
    const score = Math.max(0, 100 - (issues.length * 20));
    const ok = issues.length === 0;
    setStrength({ score, issues, ok });
    return { score, issues, ok };
  }, []);
  return { strength, updatePasswordMeter };
}

export default function Inscription({ setUser }: InscriptionProps) {
  const [formData, setFormData] = useState({ nom: '', email: '', motdepasse: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { strength, updatePasswordMeter } = usePasswordMeter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!strength.ok) {
      setMessage('Mot de passe faible. Veuillez corriger les erreurs listées.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('https://universite-quiz-app-production.up.railway.app/api/auth/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMessage('Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
      } else {
        setMessage(data.message || data.details?.join(', ') || 'Une erreur est survenue.');
      }
    } catch (err) {
      setMessage('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newFormData = { ...prev, [name]: value };
        if (name === 'motdepasse') {
            updatePasswordMeter(value, newFormData.email, newFormData.nom);
        }
        return newFormData;
    });
  };

  return (
    <section className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6">Inscription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required minLength={2} maxLength={100} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} name="motdepasse" placeholder="Mot de passe" value={formData.motdepasse} onChange={handleChange} required minLength={8} maxLength={72} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">👁️</button>
        </div>
        
        {formData.motdepasse.length > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${strength.score < 50 ? 'bg-red-500' : strength.score < 80 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                style={{ width: `${strength.score}%` }}>
              </div>
            </div>
            {!strength.ok && <ul className="text-sm text-red-500 list-disc list-inside">{strength.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}
          </div>
        )}

        <button type="submit" disabled={loading || !strength.ok} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>
      {message && <p className={`mt-4 p-3 rounded-lg text-center ${message.includes('réussie') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
      <p className="mt-6 text-center text-gray-600">
        Déjà un compte ? <Link to="/connexion" className="text-blue-600 hover:underline">Connectez-vous</Link>
      </p>
    </section>
  );
}
