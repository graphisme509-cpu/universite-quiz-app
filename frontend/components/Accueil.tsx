import React from 'react';
import { Link } from 'react-router-dom';

// FIX: Extracted props into a type alias to fix TS error with children prop.
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{children}</p>
    </div>
);

export default function Accueil() {
  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          La connaissance à votre portée.
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Notre plateforme de quiz interactifs est conçue pour vous aider à exceller dans vos études. Testez-vous, progressez et atteignez vos objectifs académiques.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/quiz" className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Commencer un Quiz
          </Link>
          <Link to="/inscription" className="bg-white text-gray-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg border">
            S'inscrire
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Une plateforme tout-en-un</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard title="Quiz Interactifs" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                Accédez à des dizaines de quiz dans toutes les matières pour évaluer et renforcer vos connaissances.
            </FeatureCard>
            <FeatureCard title="Suivi de Progression" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
                Visualisez vos résultats, suivez votre progression et identifiez vos points forts et faibles grâce à un tableau de bord personnel.
            </FeatureCard>
            <FeatureCard title="Classement & Badges" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}>
                Motivez-vous en comparant vos scores avec ceux des autres étudiants et collectionnez des badges pour vos réussites.
            </FeatureCard>
        </div>
      </section>
    </div>
  );
}