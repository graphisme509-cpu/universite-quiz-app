import React, { useEffect, useState } from 'react';
import { User } from '../../types';

interface DashboardProgressionProps {
  user: User;
}

// Interfaces pour structurer les données agrégées
interface Feedback {
  question: string;
  correct: boolean;
  explanation: string;
}

interface UserQuizScore {
  quizName: string;
  score: number;
}

interface UserCardDetails {
  rank: number | string;
  totalScore: number;
  badges: string[];
  quizScores: UserQuizScore[];
}

const API_BASE_URL = 'https://universite-quiz-app-production.up.railway.app';

export default function DashboardProgression({ user }: DashboardProgressionProps) {
  const [cardDetails, setCardDetails] = useState<UserCardDetails | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ordre de supériorité des badges (identique à DashboardClassement)
  const badgeOrder = ['Débutant', 'Amateur', 'Pro', 'Expert', 'Maître'];

  const getHighestBadge = (badges: string[]) => {
    if (!badges || badges.length === 0) return null;
    for (let i = badgeOrder.length - 1; i >= 0; i--) {
      if (badges.includes(badgeOrder[i])) {
        return badgeOrder[i];
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. On récupère le classement pour trouver le Rang et le Score Total (si dispo)
        const resClassement = await fetch(`${API_BASE_URL}/api/dashboard/classement`, { credentials: 'include', cache: 'no-store' });
        // 2. On récupère les détails (Badges, Scores par quiz)
        const resDetails = await fetch(`${API_BASE_URL}/api/dashboard/user-details/${user.id}`, { credentials: 'include', cache: 'no-store' });
        // 3. On récupère la progression (juste pour les feedbacks)
        const resProgression = await fetch(`${API_BASE_URL}/api/dashboard/progression`, { credentials: 'include' });

        if (!resClassement.ok || !resDetails.ok || !resProgression.ok) {
          throw new Error("Erreur lors du chargement des données.");
        }

        const dataClassement = await resClassement.json();
        const dataDetails = await resDetails.json();
        const dataProgression = await resProgression.json();

        // Traitement du classement pour trouver l'utilisateur actuel
        let rank: number | string = 'N/A';
        let totalScore = 0;
        
        // On cherche l'utilisateur dans le top 50 récupéré
        if (Array.isArray(dataClassement)) {
            const userInRanking = dataClassement.find((u: any) => u.id === user.id);
            if (userInRanking) {
                rank = userInRanking.rank;
                totalScore = userInRanking.score;
            } else {
                // Fallback si l'utilisateur n'est pas dans le top 50: on calcule le score total via les détails
                if(dataDetails.quizScores) {
                    totalScore = dataDetails.quizScores.reduce((acc: number, curr: any) => acc + curr.score, 0);
                }
                rank = ">50";
            }
        }

        // Traitement des badges (format string ou array selon l'API)
        const rawBadges = dataDetails.badges;
        const badgesArray = Array.isArray(rawBadges) 
            ? rawBadges 
            : (typeof rawBadges === 'string' && rawBadges.length > 0 ? rawBadges.split(', ').filter(Boolean) : []);

        setCardDetails({
            rank,
            totalScore,
            badges: badgesArray,
            quizScores: dataDetails.quizScores || []
        });

        setFeedbacks(dataProgression.feedbacks || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user.id]);

  if (loading) return (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
    </div>
  );

  if (error) return <div className="p-8 bg-red-100 text-red-800 rounded-lg shadow-md text-center"><p>{error}</p></div>;

  return (
    <section className="space-y-8">
      <h1 className="text-4xl font-bold text-slate-800 mb-6">Ma Progression</h1>
      
      {/* Carte Utilisateur (Style identique à DashboardClassement) */}
      {cardDetails && (
        <div className="rounded-lg shadow-md border border-gray-200 p-6 max-w-md mx-auto bg-green-100">
            <h2 className="text-2xl font-bold text-center mb-4">{user.name}</h2>
            <div className="space-y-3 text-lg">
                <p><strong>Rang :</strong> #{cardDetails.rank}</p>
                <p><strong>Score :</strong> {cardDetails.totalScore}</p>
                <p><strong>Badge :</strong> {getHighestBadge(cardDetails.badges) || 'Aucun'}</p>
                
                {cardDetails.quizScores.length > 0 && (
                <div>
                    <strong>Scores par quiz :</strong>
                    <ul className="mt-2 space-y-1 text-lg">
                    {cardDetails.quizScores.map((quiz, idx) => (
                        <li key={idx}>{quiz.quizName}: {quiz.score}</li>
                    ))}
                    </ul>
                </div>
                )}
            </div>
            {/* Bouton retour supprimé comme demandé */}
        </div>
      )}
      
      {/* Section Feedbacks conservée */}
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Feedback sur vos dernières réponses</h3>
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {feedbacks.length ? feedbacks.map((f, i) => 
                <li key={i} className="p-3 border rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-800">{f.question}</p>
                    <p className="text-sm">
                        <span className={`font-bold ${f.correct ? 'text-green-600' : 'text-red-600'}`}>{f.correct ? 'Correct' : 'Incorrect'}.</span> 
                        <span className="text-gray-600"> {f.explanation}</span>
                    </p>
                </li>
            ) : <p className="text-gray-500 text-center py-4">Aucun feedback récent.</p>}
        </ul>
      </div>
    </section>
  );
}
