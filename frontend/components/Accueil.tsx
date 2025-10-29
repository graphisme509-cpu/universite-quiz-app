
import React, { useState } from 'react';
import ContactForm from './ContactForm';
import { Link } from 'react-router-dom';

export default function Accueil() {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="space-y-12">
      <section className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Bienvenue sur le site de notre Université</h1>
        <p className="text-lg text-gray-600 mb-6">Votre portail vers la connaissance et le succès.</p>
        <nav className="flex justify-center space-x-6">
          <a href="#services" className="text-blue-600 hover:underline">Services</a>
          <Link to="/quiz" className="text-blue-600 hover:underline">Quiz</Link>
          <Link to="/connexion" className="text-blue-600 hover:underline">Connexion</Link>
          <a href="#contact" className="text-blue-600 hover:underline">Contact</a>
        </nav>
      </section>

      <section id="services" className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Nos Services</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 max-w-md mx-auto">
          <li>Formations en ligne et en présentiel</li>
          <li>Plateforme de consultation des résultats</li>
          <li>Espace personnel pour chaque étudiant</li>
        </ul>
      </section>

      <section id="quiz" className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-4">Testez vos connaissances</h2>
        <p className="text-center text-gray-700">Après inscription, accédez à des quiz interactifs pour réviser et vous améliorer.</p>
        <div className="text-center mt-6">
          <Link to="/quiz" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Commencer un Quiz</Link>
        </div>
      </section>

      <section id="contact" className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-4">Contactez-nous</h2>
        <div className="text-center">
            <button onClick={() => setShowContact(!showContact)} className="bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors mb-6">
            {showContact ? 'Cacher le formulaire' : 'Afficher le formulaire de contact'}
            </button>
        </div>
        {showContact && <ContactForm />}
      </section>

      <footer className="text-center py-6 text-gray-500">
        <div className="space-x-4">
          <Link to="/termes" className="hover:underline">Termes d'Utilisation</Link>
          <span>|</span>
          <Link to="/politique" className="hover:underline">Politique de Confidentialité</Link>
        </div>
        <p className="mt-2">&copy; 2025 Université. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
