import React from 'react';
import { Link } from 'react-router-dom';

export default function Politique() {
  return (
    <section className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md prose">
      <h2 className="text-3xl font-bold text-center mb-6">Politique de Confidentialité</h2>
      <p className="text-sm text-gray-500 text-center"><strong>Dernière mise à jour :</strong> 21 octobre 2025</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">1. Informations que nous collectons</h3>
      <p>Nous collectons les informations que vous nous fournissez directement lors de votre inscription, telles que votre nom, votre adresse email et votre mot de passe (qui est stocké de manière hachée). Nous collectons également les données générées par votre activité, comme vos scores de quiz et vos temps de réponse. Les adresses IP peuvent être temporairement enregistrées à des fins de sécurité et pour limiter le taux d'accès (rate limiting).</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">2. Comment nous utilisons vos données</h3>
      <p>Vos données sont utilisées pour : fournir et améliorer nos services, gérer votre compte et vous authentifier, personnaliser votre expérience (par exemple, dans le dashboard), et communiquer avec vous pour des raisons importantes (vérification d'email, réponses du support).</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">3. Partage de vos données</h3>
      <p>Nous ne vendons, ne louons et ne partageons pas vos informations personnelles avec des tiers à des fins de marketing. Vos données peuvent être partagées avec des prestataires de services qui nous aident à exploiter le Site (par exemple, un service d'envoi d'emails), mais ils sont tenus de protéger vos données. Nous pouvons également divulguer vos informations si la loi l'exige.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">4. Sécurité des données</h3>
      <p>Nous prenons la sécurité de vos données au sérieux et utilisons des mesures techniques et organisationnelles pour les protéger, y compris le chiffrement des communications (HTTPS), le hachage des mots de passe (bcrypt) et des jetons d'authentification sécurisés (JWT). Nos systèmes sont conçus pour être scalables et sécurisés.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">5. Vos droits</h3>
      <p>Conformément à la réglementation applicable (comme le RGPD), vous avez le droit d'accéder, de rectifier ou de supprimer vos données personnelles. Vous pouvez exercer ces droits en nous contactant via le formulaire de contact du site.</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">6. Cookies</h3>
      <p>Nous utilisons des cookies strictement nécessaires au fonctionnement du site, notamment des cookies `httpOnly` pour gérer votre authentification de manière sécurisée. Ces cookies ne sont pas utilisés à des fins de suivi publicitaire.</p>
      
      <div className="text-center mt-8">
        <Link to="/" className="text-green-600 hover:underline">Retour à l'Accueil</Link>
      </div>
    </section>
  );
}
