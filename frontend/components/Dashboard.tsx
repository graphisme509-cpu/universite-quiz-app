import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Quiz } from '../../types';

interface DashboardAccueilProps {
  user: User;
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function DashboardAccueil({ user }: DashboardAccueilProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingQuiz, setStartingQuiz] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/quizzes`, { credentials: 'include' });
        if (!res.ok) throw new Error("Impossible de charger les quiz.");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setQuizzes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId: number) => {
    setStartingQuiz(quizId);
    setTimeout(() => {
      navigate(`/quiz/${quizId}`);
    }, 600);
  };

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      <p className="ml-4 text-lg">Chargement des quiz...</p>
    </div>
  );

  if (error) return <div className="text-center p-8 bg-red-100 text-red-800 rounded-lg shadow-md"><p>{error}</p></div>;

  return (
    <section className="space-y-6">
      {/* BARRE SUPPRIMÉE : <header> retiré */}
      <h1 className="text-4xl font-bold text-slate-800">Bienvenue sur votre espace {user.name}</h1>
      <p className="mt-6 text-lg text-gray-500">Choisissez un quiz pour commencer à apprendre.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length > 0 ? quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all">
            <div>
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">{quiz.matiere}</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{quiz.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{quiz.questions_count} questions</p>
            </div>
            <button 
              onClick={() => handleStartQuiz(quiz.id)} 
              disabled={startingQuiz === quiz.id}
              className={`w-full font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
                startingQuiz === quiz.id 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {startingQuiz === quiz.id ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Commencer le Quiz'
              )}
            </button>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
              <p className="text-xl text-gray-600">Aucun quiz n'est disponible pour le moment.</p>
              <p className="text-gray-500 mt-2">Revenez bientôt pour de nouveaux défis !</p>
          </div>
        )}
      </div>
    </section>
  );
              }
