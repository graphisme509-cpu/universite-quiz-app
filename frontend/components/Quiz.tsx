import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Quiz as QuizType, QuizQuestion } from '../types';
import { sampleQuiz } from '../sample-quiz'; // Import the sample quiz

interface QuizProps {
  user: User | null;
}

// FIX: Extracted props into a type alias to fix TS error with special `key` prop.
type QuizQuestionCardProps = {
  q: QuizQuestion;
  qIndex: number;
  onAnswerChange: (key: string, value: string) => void;
};

const QuizQuestionCard = ({ q, qIndex, onAnswerChange }: QuizQuestionCardProps) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
        onAnswerChange(q.key_name, e.target.value);
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white transition-shadow hover:shadow-md">
            <p className="font-semibold mb-3 text-lg text-gray-800">{qIndex + 1}. {q.question}</p>
            <div className="space-y-2">
                {q.options.map((opt, idx) => (
                    <label key={idx} className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border-2 ${selectedValue === String(idx) ? 'bg-green-50 border-green-500 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                        <input
                            type="radio"
                            name={q.key_name}
                            value={idx}
                            required
                            checked={selectedValue === String(idx)}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-700">{opt.text}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};


export default function Quiz({ user }: QuizProps) {
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Record<string, { message: string, type: 'success' | 'error' }>>({});
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch('https://universite-quiz-app-production.up.railway.app/api/dashboard/quizzes', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error("Erreur lors de la récupération des quizzes.");
          return res.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            if (data.length === 0) {
                // If no quizzes from backend, load the sample one for demonstration
                setQuizzes([sampleQuiz]);
            } else {
                setQuizzes(data);
            }
        })
        .catch(err => {
            setError(err.message);
            // Also load sample quiz on API error for offline/demo capability
            setQuizzes([sampleQuiz]);
        })
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
        // Load sample quiz for logged-out users to see
        setQuizzes([sampleQuiz]);
    }
  }, [user]);

  const handleAnswerChange = (quizId: number, questionKey: string, answerIndex: string) => {
    setCurrentAnswers(prev => ({
        ...prev,
        [quizId]: {
            ...prev[quizId],
            [questionKey]: answerIndex
        }
    }));
  };

  const handleSubmit = async (quiz: QuizType) => {
    if (!user) {
        setResults({ ...results, [quiz.id]: { message: 'Vous devez être connecté pour soumettre un quiz.', type: 'error' }});
        return;
    }

    const answers = currentAnswers[quiz.id] || {};
    if (Object.keys(answers).length !== quiz.questions_count) {
        setResults({ ...results, [quiz.id]: { message: 'Veuillez répondre à toutes les questions.', type: 'error' }});
        return;
    }

    setResults(prev => ({ ...prev, [quiz.id]: { message: 'Envoi...', type: 'success' } }));
    try {
        const res = await fetch(`https://universite-quiz-app-production.up.railway.app/api/quiz/${quiz.name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(answers)
        });
        const textResult = await res.text();
        if (!res.ok) throw new Error(textResult || "Erreur lors de la soumission.");
        setResults(prev => ({ ...prev, [quiz.id]: { message: textResult, type: 'success' } }));
    } catch(err: any) {
        setResults(prev => ({ ...prev, [quiz.id]: { message: `Erreur: ${err.message}`, type: 'error' } }));
    }
  };
  
  if (loading) return (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="ml-4 text-lg">Chargement des quiz...</p>
    </div>
  );

  if (!user && quizzes.length === 0) { // Only show login prompt if sample quiz also fails to load
    return <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold mb-2">Bienvenue !</h2>
        <p className="text-xl text-gray-600">Veuillez vous <Link to="/connexion" className="text-green-600 hover:underline font-semibold">connecter</Link> pour accéder à plus de quiz et enregistrer votre progression.</p>
    </div>;
  }
  
  if (error && quizzes.length === 1 && quizzes[0].id === 0) { // Showing sample quiz despite an error
    console.log("API error, showing sample quiz:", error);
  } else if (error) { // Critical error, no quiz to show
     return <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg shadow-md"><p>{error}</p></div>;
  }

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold text-center text-slate-800 tracking-tight">Quiz Disponibles</h1>
      {quizzes.length === 0 && !loading ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border">
            <p className="text-xl text-gray-600">Aucun quiz n'est disponible pour le moment.</p>
            {user && <Link to="/dashboard" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold">Aller au Dashboard</Link>}
        </div>
      ) : quizzes.map(quiz => (
        <section key={quiz.id} className="p-6 md:p-8 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
            <header className="mb-6">
                 <h2 className="text-3xl font-bold text-slate-800">{quiz.name}</h2>
                 <p className="text-md text-gray-500">{quiz.matiere} • {quiz.questions_count} questions</p>
            </header>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(quiz); }}>
            <div className="space-y-6">
              {quiz.questions.map((q, qIndex) => (
                <QuizQuestionCard 
                    key={q.key_name} 
                    q={q} 
                    qIndex={qIndex}
                    onAnswerChange={(key, value) => handleAnswerChange(quiz.id, key, value)}
                />
              ))}
            </div>
            <button type="submit" className="mt-8 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
              Envoyer les réponses
            </button>
            {results[quiz.id] && (
              <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${results[quiz.id].type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {results[quiz.id].message}
              </div>
            )}
          </form>
        </section>
      ))}
    </div>
  );
}
