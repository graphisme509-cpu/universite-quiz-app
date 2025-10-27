import { useState } from 'react';
import ContactForm from './ContactForm.jsx';

export default function Accueil() {
  const [showContact, setShowContact] = useState(false);
  return (
    <div className="accueil">
      <section>
        <h1>Bienvenue sur le site de notre Université</h1>
        <nav>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="/quiz">Quiz</a></li>
            <li><a href="/connexion">Connexion</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </section>
      <section id="services">
        <h2>Nos Services</h2>
        <ul>
          <li>Formations en ligne et en présentiel</li>
          <li>Plateforme de consultation des résultats</li>
          <li>Espace personnel pour chaque étudiant</li>
        </ul>
      </section>
      <section id="quiz">
        <h2>Testez vos connaissances</h2>
        <p>Après inscription, accédez à des quiz pour réviser.</p>
      </section>
      <section id="contact">
        <h2>Contactez-nous</h2>
        <button onClick={() => setShowContact(!showContact)}>Afficher Form</button>
        {showContact && <ContactForm />}
      </section>
      <footer>
        <p><a href="/termes">Termes</a> | <a href="/politique">Confidentialité</a></p>
        <p>&copy; 2025 Université</p>
      </footer>
    </div>
  );
}
