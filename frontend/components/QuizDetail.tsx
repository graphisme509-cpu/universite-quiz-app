import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/dashboard/quizzes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const found = data.find((q: any) => q.id === parseInt(id));
        if (!found) throw new Error("Quiz introuvable.");
        setQuiz(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-center">Chargement du quiz...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!quiz) return <p className="p-8 text-center">Aucun quiz trouvé.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{quiz.name}</h1>

      {quiz.questions.map((q: any, i: number) => (
        <div key={i} className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
          <ul className="space-y-2">
            {q.options.map((opt: any, j: number) => (
              <li key={j} className="p-2 bg-gray-50 rounded border hover:bg-gray-100 cursor-pointer">
                {opt.text}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Retour au Dashboard
      </button>
    </div>
  );
}
