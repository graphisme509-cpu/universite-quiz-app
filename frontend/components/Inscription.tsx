import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';

interface InscriptionProps {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const PasswordStrengthMeter = ({ score, issues }: { score: number, issues: string[] }) => {
    const scoreColor = score < 40 ? 'bg-red-500' : score < 80 ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${scoreColor} h-2 rounded-full transition-all duration-300`} style={{ width: `${score}%` }}></div>
            </div>
            {issues.length > 0 && (
                <ul className="text-xs text-gray-500 list-disc list-inside">
                    {issues.map(issue => <li key={issue}>{issue}</li>)}
                </ul>
            )}
        </div>
    );
};

function usePasswordMeter() {
  const [strength, setStrength] = useState({ score: 0, issues: [] as string[], ok: false });
  const updatePasswordMeter = useCallback((pw: string, email?: string, name?: string) => {
    const issues: string[] = [];
    if (pw.length < 8) issues.push('Au moins 8 caractères.');
    if (!/[a-z]/.test(pw)) issues.push('Au moins une minuscule.');
    if (!/[A-Z]/.test(pw)) issues.push('Au moins une majuscule.');
    if (!/[0-9]/.test(pw)) issues.push('Au moins un chiffre.');
    if (!/[^\w\s]/.test(pw)) issues.push('Au moins un symbole.');
    
    const parts = [...(email ? email.split(/[@._-]/) : []), ...(name ? name.split(/\s+/) : [])]
        .map(s => s.toLowerCase()).filter(s => s.length >= 3);
    if (parts.some(p => pw.toLowerCase().includes(p))) issues.push('Ne doit pas contenir votre nom ou email.');
    
    const score = Math.max(0, 100 - (issues.length * 20));
    const ok = issues.length === 0;
    setStrength({ score, issues, ok });
    return { ok };
  }, []);
  return { strength, updatePasswordMeter };
}

export default function Inscription({ setUser }: InscriptionProps) {
  const [formData, setFormData] = useState({ nom: '', email: '', motdepasse: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { strength, updatePasswordMeter } = usePasswordMeter();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { ok } = updatePasswordMeter(formData.motdepasse, formData.email, formData.nom);
    if (!ok) {
      setMessage('Votre mot de passe ne respecte pas les critères de sécurité.');
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
        setMessage('Inscription réussie ! Vous allez être redirigé...');
        setTimeout(() => navigate('/dashboard'), 2000);
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
        if (name === 'motdepasse' || name === 'nom' || name === 'email') {
            updatePasswordMeter(newFormData.motdepasse, newFormData.email, newFormData.nom);
        }
        return newFormData;
    });
  };

  return (
    <div className="flex justify-center items-center py-8">
      <section className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">Créer un Compte</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input type="text" name="nom" placeholder="Jean Dupont" value={formData.nom} onChange={handleChange} required minLength={2} maxLength={100} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" placeholder="vous@exemple.com" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} name="motdepasse" placeholder="••••••••" value={formData.motdepasse} onChange={handleChange} required minLength={8} maxLength={72} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"> {showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>
          
          {formData.motdepasse.length > 0 && (
            <PasswordStrengthMeter score={strength.score} issues={strength.issues} />
          )}

          <button type="submit" disabled={loading || (formData.motdepasse.length > 0 && !strength.ok)} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {loading ? 'Création...' : 'S\'inscrire'}
          </button>
        </form>
        {message && <p className={`mt-4 p-3 rounded-lg text-center ${message.includes('réussie') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</p>}
        <p className="mt-6 text-center text-gray-600">
            Déjà un compte ? <Link to="/connexion" className="text-green-600 hover:underline font-medium">Connectez-vous</Link>
        </p>
      </section>
    </div>
  );
}
