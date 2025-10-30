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
      {/* 1. Barre de navigation (header) */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo officiel */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-green-600">
                UniQuiz
              </Link>
            </div>
            {/* Menu principal */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium">Accueil</Link>
              <Link to="/programmes" className="text-gray-700 hover:text-green-600 font-medium">Programmes</Link>
              <Link to="/admission" className="text-gray-700 hover:text-green-600 font-medium">Admission</Link>
              <Link to="/vie-etudiante" className="text-gray-700 hover:text-green-600 font-medium">Vie étudiante</Link>
              <Link to="/recherche" className="text-gray-700 hover:text-green-600 font-medium">Recherche</Link>
              <Link to="/apropos" className="text-gray-700 hover:text-green-600 font-medium">À propos</Link>
              <Link to="/contact" className="text-gray-700 hover:text-green-600 font-medium">Contact</Link>
            </div>
            {/* Langue, connexion et icônes */}
            <div className="flex items-center space-x-4">
              {/* Sélecteur de langue */}
              <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                <option>FR</option>
                <option>EN</option>
              </select>
              {/* Bouton Connexion */}
              <Link to="/connexion" className="bg-green-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Connexion
              </Link>
              {/* Icône recherche */}
              <button className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

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
              <Link to="/quiz" className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Commencer un Quiz
              </Link>
              <Link to="/programmes" className="bg-white text-gray-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg border">
                Découvrir les programmes
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

        {/* 4. Programmes d’études (adapté aux quiz/matières) */}
        <section id="programmes" className="px-4 bg-white py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Nos programmes d’études</h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Explorez nos niveaux de formation avec des quiz adaptés à chaque domaine.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <Link to="/licence" className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100 transition-all">
                <h3 className="font-semibold mb-2">Licence</h3>
                <p className="text-sm text-gray-600">Fondamentaux universitaires</p>
              </Link>
              <Link to="/master" className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100 transition-all">
                <h3 className="font-semibold mb-2">Master</h3>
                <p className="text-sm text-gray-600">Spécialisations avancées</p>
              </Link>
              <Link to="/doctorat" className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100 transition-all">
                <h3 className="font-semibold mb-2">Doctorat</h3>
                <p className="text-sm text-gray-600">Recherche et innovation</p>
              </Link>
              <Link to="/formation-continue" className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100 transition-all">
                <h3 className="font-semibold mb-2">Formation continue</h3>
                <p className="text-sm text-gray-600">Perfectionnement professionnel</p>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Actualités et événements */}
        <section id="actualites" className="px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Actualités et événements</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <article className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Conférence sur l'IA en éducation</h3>
              <p className="text-gray-600 mb-4">Rejoignez-nous le 15 novembre pour explorer les avancées.</p>
              <Link to="/evenements/ia" className="text-green-600 hover:underline">En savoir plus</Link>
            </article>
            <article className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Ouverture des inscriptions</h3>
              <p className="text-gray-600 mb-4">Les candidatures pour la rentrée 2026 sont ouvertes.</p>
              <Link to="/admission" className="text-green-600 hover:underline">Postuler</Link>
            </article>
            <article className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Partenariat avec TechCorp</h3>
              <p className="text-gray-600 mb-4">Nouveau programme de stages internationaux.</p>
              <Link to="/partenariats" className="text-green-600 hover:underline">Détails</Link>
            </article>
          </div>
        </section>

        {/* 6. Vie étudiante et services */}
        <section id="vie-etudiante" className="px-4 bg-white py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Vie étudiante</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="font-semibold mb-2">Logement</h3>
                <p className="text-gray-600">Résidences modernes et sécurisées</p>
              </div>
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-semibold mb-2">Restauration</h3>
                <p className="text-gray-600">Options saines et variées</p>
              </div>
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-semibold mb-2">Clubs</h3>
                <p className="text-gray-600">Activités sportives et culturelles</p>
              </div>
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="font-semibold mb-2">Bourses</h3>
                <p className="text-gray-600">Aides financières accessibles</p>
              </div>
            </div>
            {/* Témoignage exemple */}
            <div className="mt-12 text-center">
              <blockquote className="text-gray-600 italic max-w-2xl mx-auto">
                "Cette université m'a transformé. Les quiz interactifs et le soutien constant m'ont aidé à briller."
                <cite className="block mt-2 not-italic font-semibold">- Marie D., Étudiante en Master</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* 7. Recherche et innovation */}
        <section id="recherche" className="px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Recherche et innovation</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Nos laboratoires d'excellence</h3>
              <p className="text-gray-600 mb-4">Plus de 50 laboratoires dédiés à la recherche en sciences, humanités et technologies.</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Publications internationales annuelles</li>
                <li>• Collaborations avec des institutions mondiales</li>
                <li>• Projets financés par l'UE et le CNRS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Projets phares</h3>
              <p className="text-gray-600">Découvrez nos initiatives récentes en IA appliquée à l'éducation.</p>
              <Link to="/recherche/projets" className="text-green-600 hover:underline mt-4 inline-block">En savoir plus</Link>
            </div>
          </div>
        </section>

        {/* 8. Partenariats et international */}
        <section id="international" className="px-4 bg-white py-12">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10 text-slate-800">Partenariats et mobilité internationale</h2>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              Plus de 200 universités partenaires dans 50 pays. Profitez d'échanges, stages et doubles diplômes.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold">Erasmus+</h3>
                <p className="text-sm text-gray-600">Mobilité européenne</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold">Stages abroad</h3>
                <p className="text-sm text-gray-600">Expériences internationales</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold">Réseau alumni</h3>
                <p className="text-sm text-gray-600">Connexions globales</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section (intégrée comme section supplémentaire pour les quiz, gardée pour cohérence) */}
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

      {/* 9. Pied de page (footer) */}
      <footer className="bg-slate-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          {/* Coordonnées */}
          <div>
            <h3 className="text-lg font-semibold mb-4">UniQuiz Université</h3>
            <p className="text-gray-300 mb-4">123 Rue de l'Université<br />75000 Paris, France</p>
            <p className="text-gray-300">Tél: +33 1 23 45 67 89<br />Email: contact@uni-quiz.fr</p>
          </div>
          {/* Liens rapides */}
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-white">Politique de confidentialité</Link></li>
              <li><Link to="/plan-site" className="hover:text-white">Plan du site</Link></li>
            </ul>
          </div>
          {/* Réseaux sociaux */}
          <div>
            <h4 className="font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-300 hover:text-white">Facebook</a>
              <a href="https://linkedin.com" className="text-gray-300 hover:text-white">LinkedIn</a>
              <a href="https://instagram.com" className="text-gray-300 hover:text-white">Instagram</a>
              <a href="https://youtube.com" className="text-gray-300 hover:text-white">YouTube</a>
            </div>
          </div>
          {/* Portails */}
          <div>
            <h4 className="font-semibold mb-4">Portails</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/espace-etudiant" className="hover:text-white">Espace étudiant</Link></li>
              <li><Link to="/espace-professeur" className="hover:text-white">Espace professeur</Link></li>
              <li><Link to="/alumni" className="hover:text-white">Alumni</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 UniQuiz Université. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
                }
