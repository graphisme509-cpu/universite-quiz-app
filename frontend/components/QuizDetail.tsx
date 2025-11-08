import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

interface Option {
  text: string;
}

interface Question {
  key_name: string;
  question: string;
  options: Option[];
  correct_index: number;
  explanation?: string;
}

interface Quiz {
  id: number;
  name: string;
  questions: Question[];
}

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false); // Pour spinner soumission
  const [navigating, setNavigating] = useState(false); // Pour spinner retour
  const [totalHistoricalScore, setTotalHistoricalScore] = useState(0);

  // Charger le quiz
  useEffect(() => {
    const loadQuiz = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(''); // Reset error

      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/quizzes`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
        }
        const data: Quiz[] = await res.json();
        const parsedId = parseInt(id, 10);
        const found = data.find(q => q.id === parsedId);
        if (!found) throw new Error("Quiz introuvable.");
        setQuiz(found);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id]);

  // Charger le score total historique pour ce quiz
  useEffect(() => {
    const fetchTotalForQuiz = async () => {
      if (!quiz) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/user-quiz-total/${quiz.id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTotalHistoricalScore(data.total || 0);
        }
      } catch (err) {
        console.error('Erreur fetch total:', err);
      }
    };

    fetchTotalForQuiz();
  }, [quiz]);

  // Sélection d'une réponse
  const handleSelect = (questionKey: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionKey]: optionIndex }));
  };

  // Réessayer le quiz
  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResultMessage('');
    setScore(null);
  };

  // Vérifie si toutes les questions ont une réponse
  const allAnswered = quiz && quiz.questions.every(q => answers.hasOwnProperty(q.key_name));

  // Soumission et calcul du score
  const handleSubmit = async () => {
    if (!quiz || !allAnswered || submitting) return;

    setSubmitting(true);

    // Calcul local du score
    let points = 0;
    quiz.questions.forEach(q => {
      if (answers[q.key_name] === q.correct_index) points++;
    });
    const total = quiz.questions.length;
    const percent = Math.round((points / total) * 100);
    setScore(points);

    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/${quiz.name}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, score: percent }),
      });

      if (!res.ok) throw new Error('Erreur serveur');
      const text = await res.text();
      setResultMessage(`Score : ${points}/${total} (${percent}%) — ${text}`);
      setSubmitted(true);
    } catch {
      setResultMessage('Erreur serveur lors de la soumission.');
    } finally {
      setSubmitting(false);
    }
  };

  // Retour au dashboard avec spinner
  const handleBackToDashboard = () => {
    if (navigating) return;
    setNavigating(true);
    navigate('/dashboard');
  };

  // États d’attente
  if (loading) return <p className="p-8 text-center">Chargement du quiz...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!quiz) return <p className="p-8 text-center">Aucun quiz trouvé.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{quiz.name}</h1>
      <p className="mb-4 p-2 bg-blue-50 rounded text-center">Votre score cumulé pour ce quiz : {totalHistoricalScore}</p>

      {quiz.questions.map((q, i) => (
        <div
          key={q.key_name}
          className="mb-6 p-4 border rounded-lg bg-white shadow-sm transition-all"
        >
          <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
          <ul className="space-y-2">
            {q.options.map((opt, j) => {
              const isSelected = answers[q.key_name] === j;
              const isCorrect = submitted && j === q.correct_index;
              const isWrong = submitted && isSelected && j !== q.correct_index;

              return (
                <li
                  key={j}
                  onClick={() => handleSelect(q.key_name, j)}
                  className={`p-2 rounded border cursor-pointer transition
                    ${isSelected ? 'border-blue-400' : 'border-gray-200'}
                    ${isCorrect ? 'bg-green-200 border-green-400' : ''}
                    ${isWrong ? 'bg-red-200 border-red-400' : ''}
                    ${!isCorrect && !isWrong && !isSelected ? 'bg-gray-50 hover:bg-gray-100' : ''}
                  `}
                >
                  {opt.text}
                </li>
              );
            })}
          </ul>

          {submitted && q.explanation && (
            <p className="mt-2 text-sm text-gray-700 italic">
              Explication : {q.explanation}
            </p>
          )}
        </div>
      ))}

      {resultMessage && (
        <div className="p-4 bg-gray-100 rounded mb-4 text-center font-medium">
          {resultMessage}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={`h-12 w-48 rounded-lg text-white font-medium transition flex items-center justify-center
              ${allAnswered && !submitting
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            {submitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Soumettre le quiz'
            )}
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="h-12 w-48 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center font-medium"
          >
            Recommencer le quiz
          </button>
        )}

        <button
          onClick={handleBackToDashboard}
          disabled={navigating}
          className={`h-12 w-48 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center justify-center`}
        >
          {navigating ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Retour au Dashboard'
          )}
        </button>
      </div>

      {!submitted && !allAnswered && (
        <p className="mt-2 text-sm text-red-600 text-center">
          Répondez à toutes les questions pour pouvoir soumettre le quiz.
        </p>
      )}
    </div>
  );
}
