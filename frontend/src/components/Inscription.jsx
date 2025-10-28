import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hook personnalisé pour la barre de force du mot de passe (basé sur les règles backend)
function usePasswordMeter() {
  const [strength, setStrength] = useState({ score: 0, issues: [] });
  const updatePasswordMeter = (pw, email, name) => {
    const issues = [];
    if (pw.length < 8) issues.push('8 caractères min.');
    if (!/[a-z]/.test(pw)) issues.push('Minuscule.');
    if (!/[A-Z]/.test(pw)) issues.push('Majuscule.');
    if (!/[0-9]/.test(pw)) issues.push('Chiffre.');
    if (!/[^\w\s]/.test(pw)) issues.push('Symbole.');
    const parts = [...(email ? email.split(/[@._-]/) : []), ...(name ? name.split(/\s+/) : [])].map(s => s.toLowerCase()).filter(s => s.length >= 3);
    if (parts.some(p => pw.toLowerCase().includes(p))) issues.push('Pas nom/email.');
    if (/0123|1234|abcd|qwerty|password/i.test(pw)) issues.push('Évitez séquences évidentes.');
    const score = Math.max(0, 100 - (issues.length * 20));
    setStrength({ score, issues, ok: issues.length === 0 });
    return { score, issues, ok: issues.length === 0 };
  };
  return { strength, updatePasswordMeter };
}

export default function Inscription({ setUser }) {
  const [formData, setFormData] = useState({ nom: '', email: '', motdepasse: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [verifyLink, setVerifyLink] = useState('');
  const { strength, updatePasswordMeter } = usePasswordMeter();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!strength.ok) {
    toast.error('❌ Mot de passe faible. Corrigez les erreurs.');
    return;
  }

  setLoading(true); // 🔒 Désactive le bouton
  const pendingToast = toast.info('⏳ Inscription en cours...', { autoClose: false });

  try {
    const res = await fetch(
      'https://universite-quiz-app-production.up.railway.app/api/auth/inscription',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      }
    );

    const data = await res.json();
    toast.dismiss(pendingToast);

    if (res.ok) {
  setUser(data.user);
  const backendVerifyLink = `${process.env.PUBLIC_BASE_URL}/api/auth/verify-email?token=${data.user.email_verify_token}`;
  setVerifyLink(backendVerifyLink);
  setFormData({ nom: '', email: '', motdepasse: '' });
  setLoading(false);

  toast.success('✓ Inscription réussie ! Vérifiez votre email.', { autoClose: 4000 });

  // Redirection automatique vers backend pour vérifier
  setTimeout(() => {
    window.location.href = backendVerifyLink;
  }, 2000);
    } else if (res.status === 409) {
      toast.error('⚠️ Cet email est déjà utilisé.', { autoClose: 3000 });
    } else if (res.status === 400 && data.details) {
      toast.error(`⚠️ Mot de passe faible : ${data.details.join(', ')}`);
    } else {
      toast.error(`❌ ${data.message || 'Erreur inconnue.'}`);
    }
  } catch (err) {
    toast.dismiss(pendingToast);
    toast.error('⚠️ Erreur réseau. Réessayez.', { autoClose: 3000 });
  } finally {
    setLoading(false); // 🔓 Réactive le bouton
  }
};

const handlePasswordChange = (e) => {
  const newPass = e.target.value;
  setFormData({ ...formData, motdepasse: newPass });
  updatePasswordMeter(newPass, formData.email, formData.nom);
};

  
  return (
    <>
    <section>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required minLength={2} maxLength={100} />
        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        <input
  type={showPass ? 'text' : 'password'}
  placeholder="Mot de passe"
  value={formData.motdepasse}
  onChange={handlePasswordChange}
  required
  minLength={8}
  maxLength={72}
/>
        <button type="button" onClick={() => setShowPass(!showPass)}>👁️</button>
        {/* Barre de force */}
        <div className="password-meter">
          <div style={{ width: `${strength.score}%`, background: strength.ok ? 'green' : strength.score > 50 ? 'orange' : 'red' }}></div>
          {!strength.ok && <ul>{strength.issues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>}
        </div>
        <button
  type="submit"
  disabled={loading}
  className={`btn-inscription ${loading ? 'loading' : ''}`}
>
  {loading ? '⏳ Inscription...' : 'S’inscrire'}
</button>
      </form>
      {message && <p className={message.includes('OK') ? 'success' : 'error'}>{message}</p>}
      {verifyLink && <p>Vérifiez votre email : <a href={verifyLink}>Lien de vérification</a></p>}
      <p><a href="/connexion">Déjà un compte ?</a></p>
    </section>
    <ToastContainer />
    </>
  );
    }
