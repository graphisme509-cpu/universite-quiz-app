
import React from 'react';
import { Link } from 'react-router-dom';

export default function Termes() {
  return (
    <section className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md prose">
      <h2 className="text-3xl font-bold text-center mb-6">Termes d'Utilisation</h2>
      <p className="text-sm text-gray-500 text-center"><strong>Dernière mise à jour :</strong> 21 octobre 2025</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">1. Acceptation des Termes</h3>
      <p>En accédant ou utilisant cette plateforme (ci-après "le Site"), vous acceptez d'être lié par ces Termes d'Utilisation. Si vous n'êtes pas d'accord avec une partie des termes, vous n'avez pas la permission d'accéder au Site.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">2. Utilisation du Site</h3>
      <p>Le Site et son contenu sont destinés à des fins éducatives et personnelles. Vous acceptez de ne pas utiliser le Site à des fins illégales ou interdites par ces Termes. Il est interdit de copier le contenu sans autorisation, d'interférer avec le bon fonctionnement du site, ou de tenter d'obtenir un accès non autorisé à nos systèmes.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">3. Comptes et Sécurité</h3>
      <p>Vous êtes responsable de la protection de votre mot de passe et de toutes les activités qui se déroulent sous votre compte. Vous devez nous notifier immédiatement de toute violation de sécurité ou utilisation non autorisée de votre compte. Nous ne serons pas responsables des pertes causées par un accès non autorisé.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">4. Propriété Intellectuelle</h3>
      <p>Tout le contenu présent sur le Site, y compris les textes, graphiques, logos, et quiz, est la propriété de l'Université et est protégé par les lois sur le droit d'auteur. L'usage personnel et non-commercial est autorisé uniquement.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">5. Limitation de Responsabilité</h3>
      <p>Le Site est fourni "tel quel", sans aucune garantie, expresse ou implicite. Nous ne garantissons pas que le site sera disponible sans interruption ou sans erreur. En aucun cas, l'Université ne sera tenue responsable de tout dommage direct ou indirect résultant de l'utilisation du Site.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">6. Modifications des Termes</h3>
      <p>Nous nous réservons le droit de modifier ces Termes à tout moment. Il est de votre responsabilité de consulter cette page périodiquement pour prendre connaissance des changements.</p>
      
      <div className="text-center mt-8">
        <Link to="/" className="text-blue-600 hover:underline">Retour à l'Accueil</Link>
      </div>
    </section>
  );
}
