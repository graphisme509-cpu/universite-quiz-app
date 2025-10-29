import { Quiz } from './types';

export const sampleQuiz: Quiz = {
  id: 0,
  name: "Quiz de Culture Générale (Exemple)",
  matiere: "Divers",
  questions_count: 5,
  questions: [
    {
      key_name: "q1_geo",
      question: "Quelle est la capitale de l'Australie ?",
      options: [{ text: "Sydney" }, { text: "Melbourne" }, { text: "Canberra" }, { text: "Perth" }],
      correct_index: 2,
      explanation: "Bien que Sydney soit la plus grande ville, Canberra est la capitale officielle de l'Australie."
    },
    {
      key_name: "q2_art",
      question: "Qui a peint la Joconde ?",
      options: [{ text: "Vincent van Gogh" }, { text: "Pablo Picasso" }, { text: "Claude Monet" }, { text: "Léonard de Vinci" }],
      correct_index: 3,
      explanation: "La Joconde (ou Mona Lisa) est une œuvre emblématique de Léonard de Vinci, réalisée au début du 16ème siècle."
    },
    {
      key_name: "q3_science",
      question: "Quel est le symbole chimique de l'or ?",
      options: [{ text: "Ag" }, { text: "Au" }, { text: "Fe" }, { text: "Pb" }],
      correct_index: 1,
      explanation: "Le symbole 'Au' vient du mot latin pour l'or, 'aurum'."
    },
    {
      key_name: "q4_history",
      question: "En quelle année a eu lieu la chute du mur de Berlin ?",
      options: [{ text: "1985" }, { text: "1989" }, { text: "1991" }, { text: "1993" }],
      correct_index: 1,
      explanation: "La chute du mur de Berlin a eu lieu le 9 novembre 1989, marquant un tournant majeur dans la fin de la Guerre Froide."
    },
     {
      key_name: "q5_tech",
      question: "Quel protocole est utilisé pour envoyer des emails ?",
      options: [{ text: "FTP" }, { text: "HTTP" }, { text: "SMTP" }, { text: "SSH" }],
      correct_index: 2,
      explanation: "SMTP (Simple Mail Transfer Protocol) est le protocole standard pour l'envoi de courriers électroniques sur Internet."
    }
  ]
};
