export default function Politique() {
  return (
    <section>
      <h2>Politique de Confidentialité</h2>
      <p><strong>Dernière mise à jour :</strong> 21 octobre 2025</p>
      <h3>1. Informations Collectées</h3>
      <p>Nous collectons : nom, email, mot de passe (haché), scores quiz, IP (pour rate limiting). Pas de données sensibles inutiles.</p>
      <h3>2. Utilisation des Données</h3>
      <p>Les données servent à : authentification, personnalisation (dashboard), envoi d'emails (vérif/contact). Pas de vente à des tiers.</p>
      <h3>3. Partage de Données</h3>
      <p>Seulement avec prestataires (e.g., SMTP pour emails) sous contrat. En cas de loi, nous coopérons.</p>
      <h3>4. Sécurité</h3>
      <p>Données chiffrées (HTTPS, bcrypt, JWT). Pool DB pour scalabilité sécurisée (>1000 users).</p>
      <h3>5. Vos Droits</h3>
      <p>Accès/suppression via support. Contactez-nous pour GDPR.</p>
      <h3>6. Cookies</h3>
      <p>Utilisation de cookies httpOnly pour auth (non traçables).</p>
      <p><a href="/">Retour à l'Accueil</a></p>
    </section>
  );
}
