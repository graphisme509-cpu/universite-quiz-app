import React from 'react';
import { Link } from 'react-router-dom';

// FIX: Added 'children' to props type to allow content inside the component.
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 text-center">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4 mx-auto">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

export default function Accueil() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-16 md:space-y-24">
        {/* 2. Bannière principale */}
        <section className="relative bg-gradient-to-r from-green-50 to-blue-50 pt-8 pb-12 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: 'url(/images/campus-hero.jpg)' }}
          ></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
              La connaissance à votre portée.
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Notre plateforme universitaire de quiz interactifs est conçue pour vous aider à exceller dans vos études. Testez-vous, progressez et atteignez vos objectifs académiques au sein d'une communauté d'excellence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/historique"
                className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Historique
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Programmes d’études */}
        <section className="px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">
            Nos programmes d’études
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
            Explorez nos niveaux de formation avec des quiz adaptés à chaque domaine.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* --- Section Jardinière --- */}
            <Link to="/licence" className="block">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
                  {/* Icône de diplôme */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-6 0h12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center">Jardinière</h3>
              </div>
            </Link>

            {/* --- Section Aide-jardinière --- */}
            <Link to="/master" className="block">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
                  {/* Icône de diplôme */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-6 0h12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center">Aide-jardinière</h3>
              </div>
            </Link>

          </div>
        </section>
      </div>
    </div>
  );
}
