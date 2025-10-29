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

  // Charger le quiz
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/dashboard/quizzes`, { credentials: 'include' })
      .then(res => res.json())
      .then((data: Quiz[]) => {
        const found = data.find(q => q.id === parseInt(id, 10));
        if (!found) throw new Error("Quiz introuvable.");
        setQuiz(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Sélection d'une réponse
  const handleSelect = (questionKey: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionKey]: optionIndex }));
  };

  // Soumission et calcul du score
  const handleSubmit = async () => {
    if (!quiz) return;

    // calcul local du score
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
    }
  };

  // États d’attente
  if (loading) return <p className="p-8 text-center">Chargement du quiz...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!quiz) return <p className="p-8 text-center">Aucun quiz trouvé.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{quiz.name}</h1>

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
              💡 {q.explanation}
            </p>
          )}
        </div>
      ))}

      {resultMessage && (
        <div className="p-4 bg-gray-100 rounded mb-4 text-center font-medium">
          {resultMessage}
        </div>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Soumettre le quiz
        </button>
      )}

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 ml-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        Retour au Dashboard
      </button>
    </div>
  );
}

    fetch(`${API_BASE_URL}/api/dashboard/quizzes`, { credentials: 'include' })
      .then(res => res.json())
      .then((data: Quiz[]) => {
        const found = data.find(q => q.id === parseInt(id, 10));
        if (!found) throw new Error("Quiz introuvable.");
        setQuiz(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (questionKey: string, optionIndex: number) => {
    if (submitted) return; // pas de modification après soumission
    setAnswers(prev => ({ ...prev, [questionKey]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/quiz/${quiz.name}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const text = await res.text();
      setResultMessage(text);
      setSubmitted(true);
    } catch (err) {
      setResultMessage('Erreur serveur lors de la soumission.');
    }
  };

  if (loading) return <p className="p-8 text-center">Chargement du quiz...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!quiz) return <p className="p-8 text-center">Aucun quiz trouvé.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{quiz.name}</h1>

      {quiz.questions.map((q, i) => (
        <div key={q.key_name} className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
          <ul className="space-y-2">
            {q.options.map((opt, j) => {
              const isSelected = answers[q.key_name] === j;
              return (
                <li
                  key={j}
                  onClick={() => handleSelect(q.key_name, j)}
                  className={`p-2 rounded border cursor-pointer hover:bg-gray-100
                    ${isSelected ? 'bg-blue-200 border-blue-400' : 'bg-gray-50'}`}
                >
                  {opt.text}
                </li>
              );
            })}
          </ul>
          {submitted && answers[q.key_name] !== q.correct_index && (
            <p className="mt-2 text-red-600 text-sm">
              Réponse correcte : {q.options[q.correct_index].text}
            </p>
          )}
          {submitted && answers[q.key_name] === q.correct_index && (
            <p className="mt-2 text-green-600 text-sm">Bonne réponse !</p>
          )}
        </div>
      ))}

      {resultMessage && <p className="p-4 bg-gray-100 rounded mb-4">{resultMessage}</p>}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Soumettre le quiz
        </button>
      )}

      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 ml-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        Retour au Dashboard
      </button>
    </div>
  );
}
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/dashboard/quizzes`, { credentials: 'include' })
      .then(res => res.json())
      .then((data: Quiz[]) => {
        const found = data.find(q => q.id === parseInt(id));
        if (!found) throw new Error('Quiz introuvable.');
        // par défaut toutes les questions simples sont single
        setQuiz(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-center">Chargement du quiz...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!quiz) return <p className="p-8 text-center">Aucun quiz trouvé.</p>;

  // Gestion des réponses (single ou multiple)
  const handleSelect = (questionKey: string, optionIndex: number, multiple?: boolean) => {
    if (submitted) return;

    setAnswers(prev => {
      const prevAnswers = prev[questionKey] || [];
      if (multiple) {
        // toggle
        if (prevAnswers.includes(optionIndex)) {
          return { ...prev, [questionKey]: prevAnswers.filter(i => i !== optionIndex) };
        } else {
          return { ...prev, [questionKey]: [...prevAnswers, optionIndex] };
        }
      } else {
        return { ...prev, [questionKey]: [optionIndex] };
      }
    });
  };

  // Score live avant soumission
  const liveScore = () => {
    if (!quiz) return 0;
    let count = 0;
    for (const q of quiz.questions) {
      const ans = answers[q.key_name] || [];
      if (!q.multiple && ans[0] === q.correct_index) count++;
      else if (q.multiple) {
        // pour multiple, score partiel si toutes correctes et rien de faux
        const correctSet = [q.correct_index]; // ici à adapter si plusieurs correctes côté serveur
        if (ans.every(a => correctSet.includes(a)) && correctSet.every(c => ans.includes(c))) count++;
      }
    }
    return count;
  };

  const handleSubmit = async () => {
    try {
      // transformer pour le serveur (single answer attendu)
      const payload: Record<string, number> = {};
      Object.keys(answers).forEach(k => {
        payload[k] = answers[k][0] ?? null; // serveur actuel attend 1 réponse par question
      });

      const res = await fetch(`${API_BASE_URL}/api/quiz/${quiz.name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      setFeedback(text);

      const match = text.match(/(\d+)\/(\d+)/);
      if (match) setScore(parseInt(match[1]));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setFeedback('Erreur serveur, réessayez.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{quiz.name}</h1>

      <p className="mb-4 text-lg font-semibold">Score live: {liveScore()}/{quiz.questions.length}</p>

      {quiz.questions.map((q, i) => (
        <div key={i} className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
          <ul className="space-y-2">
            {q.options.map((opt, j) => {
              const isSelected = answers[q.key_name]?.includes(j);
              const correct = submitted && j === q.correct_index;
              const wrong = submitted && isSelected && j !== q.correct_index;

              return (
                <li
                  key={j}
                  onClick={() => handleSelect(q.key_name, j, q.multiple)}
                  className={`p-2 rounded border cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-200 border-blue-400 scale-105' : 'bg-gray-50 border-gray-200'}
                    ${correct ? 'bg-green-300 border-green-500 font-bold' : ''}
                    ${wrong ? 'bg-red-300 border-red-500 font-bold' : ''}
                    hover:scale-105 hover:bg-gray-100`}
                  style={{ transition: 'all 0.2s' }}
                >
                  {opt.text}
                </li>
              );
            })}
          </ul>
          {submitted && q.explanation && (
            <p className="mt-2 text-sm text-gray-700 italic">💡 {q.explanation}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Soumettre
        </button>
      ) : (
        <div className="mt-8">
          <p className="text-xl font-bold text-center mb-4">Résultat: {score !== null ? `${score}/${quiz.questions.length}` : '-'}</p>
          <p className="text-center text-gray-700 mb-4">{feedback}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 block mx-auto"
          >
            Retour au Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
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
