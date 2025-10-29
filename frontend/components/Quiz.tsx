
import React, { useEffect, useState } from 'react';
// FIX: Import Link from react-router-dom
import { Link } from 'react-router-dom';
import { User, Quiz as QuizType } from '../types';

interface QuizProps {
  user: User | null;
}

export default function Quiz({ user }: QuizProps) {
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetch('/api/dashboard/quizzes', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de la récupération des quizzes.");
          return res.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            setQuizzes(data)
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (quizName: string, answers: Record<string, string>) => {
    setResults(prev => ({ ...prev, [quizName]: 'Envoi...' }));
    try {
        const res = await fetch(`/api/quiz/${quizName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(answers)
        });
        const textResult = await res.text();
        if (!res.ok) throw new Error(textResult || "Erreur lors de la soumission.");
        setResults(prev => ({ ...prev, [quizName]: textResult }));
    } catch(err: any) {
        setResults(prev => ({ ...prev, [quizName]: `Erreur: ${err.message}` }));
    }
  };
  
  if (!user) {
    return <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-xl">Veuillez vous <Link to="/connexion" className="text-blue-600 hover:underline">connecter</Link> pour accéder aux quiz.</p>
    </div>;
  }
  
  if (loading) return <div className="text-center p-8"><p>Chargement des quiz...</p></div>;
  if (error) return <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg shadow-md"><p>{error}</p></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center">Quiz Disponibles</h1>
      {quizzes.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-xl">Vous n'avez pas encore créé de quiz.</p>
            <Link to="/dashboard" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Aller au Dashboard</Link>
        </div>
      ) : quizzes.map(quiz => (
        <form key={quiz.id} onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const answers = Object.fromEntries(formData.entries()) as Record<string, string>;
          handleSubmit(quiz.name, answers);
        }} className="p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-600">
          <h2 className="text-2xl font-bold mb-4">{quiz.name} ({quiz.matiere})</h2>
          <div className="space-y-6">
            {quiz.questions.map((q, qIndex) => (
              <div key={q.key_name} className="p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold mb-3">{qIndex + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                      <input type="radio" name={q.key_name} value={idx} required className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                      <span className="ml-3 text-gray-700">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            Envoyer les réponses
          </button>
          {results[quiz.name] && (
            <div className={`mt-4 p-3 rounded-lg text-center ${results[quiz.name].includes('Erreur') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {results[quiz.name]}
            </div>
          )}
        </form>
      ))}
    </div>
  );
}