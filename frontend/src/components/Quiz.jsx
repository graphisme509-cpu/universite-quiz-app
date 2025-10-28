import { useEffect, useState } from 'react';

export default function Quiz({ user }) {
  if (!user) return <p>Connectez-vous pour quiz.</p>;
  const [quizzes, setQuizzes] = useState([]);  // Fetch from /api/dashboard/quizzes

  useEffect(() => {
    fetch('/api/dashboard/quizzes', { credentials: 'include' }).then(r => r.json()).then(setQuizzes);
  }, []);

  const handleSubmit = async (quizName, answers) => {
    const res = await fetch(`https://universite-quiz-app-production.up.railway.app/api/quiz/${quizName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(answers)
    });
    alert(await res.text());
  };

  return (
    <div>
      <h1>Quiz</h1>
      {quizzes.map(quiz => (
        <form key={quiz.id} onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const answers = Object.fromEntries(formData);
          handleSubmit(quiz.name, answers);
        }}>
          <h2>{quiz.name}</h2>
          {quiz.questions.map(q => (
            <div key={q.key_name}>
              <label>{q.question}</label>
              {q.options.map((opt, idx) => (
                <label key={idx}><input type="radio" name={q.key_name} value={idx} /> {opt.text}</label>
              ))}
            </div>
          ))}
          <button type="submit">Envoyer</button>
        </form>
      ))}
    </div>
  );
}
