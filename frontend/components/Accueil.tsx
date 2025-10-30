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
 <div className="flex justify-center">
 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
 {icon}
 </div>
 </div>
 <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
 <p className="text-gray-600 text-center">{children}</p>
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

 {/* Nouvelle section marketing sur les 10 ans d'existence */}
 <section className="px-4">
 <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">10 ans d'excellence universitaire</h2>
 <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
 Depuis une décennie, notre université s'impose comme un pilier de l'éducation supérieure, formant des leaders innovants et passionnés. Célébrons ensemble 10 ans de réussites, d'innovations et de transformations qui ont marqué des milliers de vies.
 </p>
 <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
 <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 text-center">
 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4 mx-auto">
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
 </svg>
 </div>
 <p className="text-gray-700">Une expertise éprouvée en formation de qualité, reconnue internationalement.</p>
 </div>
 <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 text-center">
 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4 mx-auto">
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 </div>
 <p className="text-gray-700">Un réseau d'anciens élèves influents, fruit de nos 10 années de partenariats solides.</p>
 </div>
 </div>
 </section>

 {/* 4. Programmes d’études (adapté aux quiz/matières) */}
 <section className="px-4">
 <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Nos programmes d’études</h2>
 <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
 Explorez nos niveaux de formation avec des quiz adaptés à chaque domaine.
 </p>
 <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
 <Link to="/licence" className="block">
 <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
 <div className="flex justify-center">
 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path d="M12 14l9-5-9-5-9 5 9 5z" />
 <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
 </svg>
 </div>
 </div>
 <div className="flex-grow flex items-center justify-center">
 <h3 className="text-xl font-semibold">Jardinière</h3>
 </div>
 </div>
 </Link>
 <Link to="/master" className="block">
 <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
 <div className="flex justify-center">
 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4">
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path d="M12 14l9-5-9-5-9 5 9 5z" />
 <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
 </svg>
 </div>
 </div>
 <div className="flex-grow flex items-center justify-center">
 <h3 className="text-xl font-semibold">Aide-jardinière</h3>
 </div>
 </div>
 </Link>
 </div>
 </section>

 {/* 5. Actualités et événements */}
 <section className="px-4">
 <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Actualités et événements</h2>
 <div className="grid gap-8 max-w-5xl mx-auto">
 <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 text-center">
 <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-4 mx-auto">
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h6" />
 </svg>
 </div>
 <h3 className="text-xl font-semibold mb-2">Création de notre nouveau site web</h3>
 <p className="text-gray-600 mb-4">Cliquez sur l'article pour en apprendre plus sur le site web.</p>
 <div>
 <Link to="/evenements/ia" className="text-green-600 hover:underline">En savoir plus</Link>
 </div>
 </div>
 </div>
 </section>

 {/* 6. Témoignages */}
 <section className="px-4">
 <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Témoignages</h2>
 <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
 <FeatureCard title="Marie D., Étudiante en Master" icon={
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 21l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
 }>
 <span className="italic">"Cette université m'a transformé. Les quiz interactifs et le soutien constant m'ont aidé à briller."</span>
 </FeatureCard>
 <FeatureCard title="Pierre L., Étudiant en Jardinière" icon={
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 21l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
 }>
 <span className="italic">"Grâce à cette plateforme, j'ai pu progresser rapidement dans mes études."</span>
 </FeatureCard>
 <FeatureCard title="Sophie M., Étudiante en Aide-jardinière" icon={
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 21l 1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
 }>
 <span className="italic">"L'environnement est motivant et les ressources sont excellentes."</span>
 </FeatureCard>
 </div>
 </section>

 {/* Features Section (intégrée comme section supplémentaire pour les quiz, gardée pour cohérence) */}
 <section id="features" className="px-4">
 <h2 className="text-3xl font-bold text-center mb-10">Connectez-vous pour accéder à votre espace étudiant</h2>
 <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
 <FeatureCard title="Quiz Interactifs" icon={
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
 }>
 Accédez à des dizaines de quiz dans toutes les matières pour évaluer et renforcer vos connaissances.
 </FeatureCard>
 <FeatureCard title="Suivi de Progression" icon={
 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
 }>
 Visualisez vos résultats, suivez votre progression et identifiez vos points forts et faibles grâce à un tableau de bord personnel.
 </FeatureCard>
 <FeatureCard title="Classement & Badges" icon={
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          }>
 Motivez-vous en comparant vos scores avec ceux des autres étudiants et collectionnez des badges pour vos réussites.
 </FeatureCard>
 </div>
 </section>
 </div>
 </div>
 );
}
