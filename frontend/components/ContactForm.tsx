
import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ nom: '', email: '', message: '' });
  const [response, setResponse] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.nom || !formData.email || !formData.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setResponse({ type: 'error', text: 'Veuillez remplir tous les champs correctement.' });
      return;
    }
    setLoading(true);
    setResponse({ type: '', text: '' });
    try {
      const res = await fetch('https://universite-quiz-app-production.up.railway.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setResponse({ type: 'success', text: 'Message envoyé avec succès !' });
        setFormData({ nom: '', email: '', message: '' });
      } else {
        throw new Error(data.error || 'Une erreur est survenue.');
      }
    } catch (err: any) {
      setResponse({ type: 'error', text: err.message || 'Erreur lors de l\'envoi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
      <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
      <textarea name="message" placeholder="Votre message" value={formData.message} onChange={handleChange} required rows={5} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
        {loading ? 'Envoi en cours...' : 'Envoyer'}
      </button>
      {response.text && (
        <div className={`p-3 mt-4 rounded-lg text-center ${response.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {response.text}
        </div>
      )}
    </form>
  );
}
