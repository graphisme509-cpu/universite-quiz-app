import { useState } from 'react';

export default function Resultats({ user }) {
  if (!user) return <p>Connectez-vous.</p>;
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('universite-quiz-app-production.up.railway.app/api/resultats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) setNotes(data.notes);
      else alert(data.message);
    } catch (err) {
      alert('Erreur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Résultats</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Code étudiant" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button type="submit" disabled={loading}>Voir</button>
      </form>
      {notes && (
        <ul>
          {Object.entries(notes).map(([mat, note]) => <li key={mat}>{mat}: {note}</li>)}
        </ul>
      )}
    </section>
  );
          }
