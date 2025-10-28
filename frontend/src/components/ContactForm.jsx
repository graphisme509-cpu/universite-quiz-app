import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ nom: '', email: '', message: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.email || !formData.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage('Champs invalides.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://universite-quiz-app-production.up.railway.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Message envoyé !');
        setFormData({ nom: '', email: '', message: '' });
      } else throw new Error(data.error);
    } catch (err) {
      setMessage(err.message || 'Erreur envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
      <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
      <textarea placeholder="Message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />
      <button type="submit" disabled={loading}>{loading ? '...' : 'Envoyer'}</button>
      {message && <div className={message.includes('envoyé') ? 'success' : 'error'}>{message}</div>}
    </form>
  );
        }
