import React from 'react';
import { Link } from 'react-router-dom';

// FIX: Added 'children' to props type to allow content inside the component.
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

const FeatureCard = ({ icon, title, children }: FeatureCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 text-center flex flex-col items-center justify-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
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

        {/* 4. Programmes d’études (adapté aux quiz/matières) */}
        <section className="px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Nos programmes d’études</h2>
          <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
            Explorez nos niveaux de formation avec des quiz adaptés à chaque domaine.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* --- Section Jardinière --- */}
            <Link to="/licence" className="block">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
                  {/* Icône de livre */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 20h9M12 4H5a2 2 0 00-2 2v13a2 2 0 002 2h7V4zm0 0h9v16h-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Jardinière</h3>
              </div>
            </Link>

            {/* --- Section Aide-jardinière --- */}
            <Link to="/master" className="block">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
                  {/* Icône de livre */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 20h9M12 4H5a2 2 0 00-2 2v13a2 2 0 002 2h7V4zm0 0h9v16h-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Aide-jardinière</h3>
              </div>
            </Link>

          </div>
        </section>

      </div>
    </div>
  );
}
