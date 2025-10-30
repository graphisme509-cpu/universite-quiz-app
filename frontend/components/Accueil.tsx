import React from 'react';
import { Link } from 'react-router-dom';

// FIX: Added 'children' to props type to allow content inside the component.
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
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-16 md:space-y-24">
        {/* 2. Bannière principale (hero section) */}
        <section className="relative bg-gradient-to-r from-green-50 to-blue-50 pt-8 pb-12 overflow-hidden">
          {/* Image ou vidéo représentative (placeholder pour une image de fond) */}
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: 'url(/images/campus-hero.jpg)' }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
              La connaissance à votre portée.
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Notre plateforme universitaire de quiz interactifs est conçue pour vous aider à exceller dans vos études. Testez-vous, progressez et atteignez vos objectifs académiques au sein d'une communauté d'excellence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/historique" className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Historique
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Présentation rapide de l’université */}
        <section id="presentation" className="px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Découvrez notre université</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fondée sur des valeurs d'excellence, d'innovation et de diversité, notre institution accompagne plus de 10 000 étudiants dans leur parcours académique. Rejoignez une communauté dynamique où la réussite est collective.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600 mb-2">10 000+</h3>
              <p className="text-gray-600">Étudiants</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600 mb-2">500+</h3>
              <p className="text-gray-600">Programmes</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600 mb-2">95%</h3>
              <p className="text-gray-600">Taux d'emploi</p>
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-8">
            <Link to="/apropos" className="text-green-600 hover:underline">À propos</Link>
            <Link to="/historique" className="text-green-600 hover:underline">Historique</Link>
            <Link to="/gouvernance" className="text-green-600 hover:underline">Gouvernance</Link>
          </div>
        </section>

        {/* Nouvelle section marketing sur les 10 ans d'existence */}
        <section className="px-4 bg-white py-12">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">10 ans d'excellence universitaire</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Depuis une décennie, notre université s'impose comme un pilier de l'éducation supérieure, formant des leaders innovants et passionnés. Célébrons ensemble 10 ans de réussites, d'innovations et de transformations qui ont marqué des milliers de vies.
            </p>
            <div className="bg-green-50 p-8 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Pourquoi choisir notre université après 10 ans ?</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>• Une expertise éprouvée en formation de qualité, reconnue internationalement.</li>
                <li>• Un réseau d'anciens élèves influents, fruit de nos 10 années de partenariats solides.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Programmes d’études (adapté aux quiz/matières) */}
        <section id="programmes" className="px-4 bg-white py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Nos programmes d’études</h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Explorez nos niveaux de formation avec des quiz adaptés à chaque domaine.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/licence" className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100 transition-all">
                <h3 className="font-semibold mb-2">Jardinière</h3>
              </Link>
              <Link to="/master" className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100 transition-all">
                <h3 className="font-semibold mb-2">Aide-jardinière</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Actualités et événements */}
        <section id="actualites" className="px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Actualités et événements</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Création de notre nouveau site web</h3>
              <p className="text-gray-600 mb-4">Rejoignez-nous le 15 novembre pour découvrir la nouvelle plateforme.</p>
              <Link to="/evenements/ia" className="text-green-600 hover:underline">En savoir plus</Link>
            </article>
          </div>
        </section>

        {/* 6. Témoignages */}
        <section id="vie-etudiante" className="px-4 bg-white py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Témoignages</h2>
            {/* Témoignage exemple */}
            <div className="mt-12 text-center">
              <blockquote className="text-gray-600 italic max-w-2xl mx-auto">
                "Cette université m'a transformé. Les quiz interactifs et le soutien constant m'ont aidé à briller."
                <cite className="block mt-2 not-italic font-semibold">- Marie D., Étudiante en Master</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Features Section (intégrée comme section supplémentaire pour les quiz, gardée pour cohérence) */}
        <section id="features" className="px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Connectez-vous pour accéder à votre espace étudiant</h2>
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
    </div>
  );
                                                                                                                                                                                  }
