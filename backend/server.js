import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import pino from 'pino';
import pinoHttp from 'pino-http';
import promClient from 'prom-client';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { MailtrapTransport } from "mailtrap";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
app.use(pinoHttp({ logger }));

// DB Pool (scalabilité)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true seulement pour SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: efde678128905b915bc0e6d66054f669,
  })
);

app.set('trust proxy', 1); // fait confiance au proxy de la plateforme

// Middlewares Sécurité/Scalabilité
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Rate Limits
const authLimiter = rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW), max: Number(process.env.RATE_LIMIT_AUTH_MAX) });
const quizLimiter = rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW), max: Number(process.env.RATE_LIMIT_QUIZ_MAX) });
app.use('/api/auth', authLimiter);
app.use('/api/quiz', quizLimiter);

// Prometheus (monitoring)
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
// test smtp
app.get('/test-smtp', async (req, res) => {
  try {
    await transporter.verify(); // Nodemailer tente la connexion
    res.send('SMTP OK ✅');
  } catch (err) {
    res.status(500).send('SMTP FAIL ❌ : ' + err.message);
  }
});

// Utils
const normalizeEmail = (email) => email.trim().toLowerCase();
const minutesFromNow = (min) => new Date(Date.now() + min * 60 * 1000);
const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

function passwordStrength(pw, { email, name }) {
  const issues = [];
  if (pw.length < 8) issues.push('8 caractères min.');
  if (!/[a-z]/.test(pw)) issues.push('Minuscule.');
  if (!/[A-Z]/.test(pw)) issues.push('Majuscule.');
  if (!/[0-9]/.test(pw)) issues.push('Chiffre.');
  if (!/[^\w\s]/.test(pw)) issues.push('Symbole.');
  const parts = [...(email ? email.split(/[@._-]/) : []), ...(name ? name.split(/\s+/) : [])].map(s => s.toLowerCase()).filter(s => s.length >= 3);
  if (parts.some(p => pw.toLowerCase().includes(p))) issues.push('Pas nom/email.');
  if (/0123|1234|abcd|qwerty|password/i.test(pw)) issues.push('Évitez séquences évidentes.');
  return { ok: issues.length === 0, issues };
}

const signupSchema = z.object({ nom: z.string().min(2).max(100).trim(), email: z.string().email().trim(), motdepasse: z.string().min(8).max(72) });
const loginSchema = z.object({ email: z.string().email().trim(), motdepasse: z.string().min(1) });

// JWT
function signAccessToken(user) { return jwt.sign({ sub: String(user.id), email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: `${process.env.ACCESS_TOKEN_TTL_MIN}m` }); }
function signRefreshToken(user) { return jwt.sign({ sub: String(user.id) }, process.env.JWT_REFRESH_SECRET, { expiresIn: `${process.env.REFRESH_TOKEN_TTL_DAYS}d` }); }
function setAuthCookies(res, access, refresh) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', access, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: Number(process.env.ACCESS_TOKEN_TTL_MIN) * 60 * 1000 });
  res.cookie('refresh_token', refresh, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS) * 24 * 60 * 60 * 1000 });
}
function clearAuthCookies(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('access_token', { httpOnly: true, secure: isProd, sameSite: 'lax' });
  res.clearCookie('refresh_token', { httpOnly: true, secure: isProd, sameSite: 'lax' });
}

// Middleware Auth
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ message: 'Non authentifié.' });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: Number(payload.sub), email: payload.email };
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide.' });
  }
}

// Routes Auth (Inscription/Connexion unifiées)
app.post('/api/auth/inscription', async (req, res) => {
  try {
    const { nom, email, motdepasse } = signupSchema.parse(req.body);
    const emailNorm = normalizeEmail(email);
    const strength = passwordStrength(motdepasse, { email: emailNorm, name: nom });
    if (!strength.ok) return res.status(400).json({ message: 'Mot de passe faible', details: strength.issues });
    const exists = await pool.query('SELECT 1 FROM users WHERE LOWER(email) = $1', [emailNorm]);
    if (exists.rowCount > 0) return res.status(409).json({ message: 'Email utilisé.' });
    const passwordHash = await bcrypt.hash(motdepasse, Number(process.env.BCRYPT_ROUNDS));
    const verifyToken = nanoid(40);
    const verifyExpires = minutesFromNow(60);
    const insert = await pool.query(
      'INSERT INTO users (name, email, password_hash, email_verify_token, email_verify_expires) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, created_at',
      [nom, emailNorm, passwordHash, verifyToken, verifyExpires]
    );
    const user = insert.rows[0];
    const verifyLink = `${process.env.PUBLIC_BASE_URL}/api/auth/verify-email?token=${verifyToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Vérifiez votre email',
      html: `<p>Bonjour ${user.name}, <a href="${verifyLink}">Vérifiez ici</a> (expire 60min).</p>`
    });
    res.status(201).json({ message: 'Inscription OK. Vérifiez email.', user });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email utilisé.' });
    logger.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token manquant.' });
    const q = await pool.query('SELECT id, email_verify_expires, email_verified FROM users WHERE email_verify_token = $1', [token]);
    if (q.rowCount === 0) return res.status(400).json({ message: 'Token invalide.' });
    const u = q.rows[0];
    if (u.email_verified) return res.json({ message: 'Déjà vérifié.' });
    if (new Date(u.email_verify_expires) < new Date()) return res.status(400).json({ message: 'Token expiré.' });
    await pool.query('UPDATE users SET email_verified = TRUE, email_verify_token = NULL, email_verify_expires = NULL WHERE id = $1', [u.id]);
    res.json({ message: 'Email vérifié.' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Erreur.' });
  }
});

app.post('/api/auth/connexion', async (req, res) => {
  try {
    const { email, motdepasse } = loginSchema.parse(req.body);
    const emailNorm = normalizeEmail(email);
    const q = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailNorm]);
    if (q.rowCount === 0 || !await bcrypt.compare(motdepasse, q.rows[0].password_hash) || !q.rows[0].email_verified) {
      return res.status(401).json({ message: 'Identifiants invalides ou email non vérifié.' });
    }
    const user = q.rows[0];
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshExp = daysFromNow(Number(process.env.REFRESH_TOKEN_TTL_DAYS));
    await pool.query('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token) DO NOTHING', [refreshToken, user.id, refreshExp]);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ message: 'Connexion OK.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Erreur.' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const rToken = req.cookies?.refresh_token;
    if (!rToken) return res.status(401).json({ message: 'Refresh manquant.' });
    const payload = jwt.verify(rToken, process.env.JWT_REFRESH_SECRET);
    const q = await pool.query('SELECT rt.token, rt.expires_at, u.* FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = $1', [rToken]);
    if (q.rowCount === 0 || new Date(q.rows[0].expires_at) < new Date()) return res.status(401).json({ message: 'Refresh invalide.' });
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [rToken]);
    const newRefresh = signRefreshToken(q.rows[0]);
    const newAccess = signAccessToken(q.rows[0]);
    const refreshExp = daysFromNow(Number(process.env.REFRESH_TOKEN_TTL_DAYS));
    await pool.query('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)', [newRefresh, payload.sub, refreshExp]);
    setAuthCookies(res, newAccess, newRefresh);
    res.json({ message: 'Rafraîchi.', user: { id: q.rows[0].id, name: q.rows[0].name, email: q.rows[0].email } });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Erreur.' });
  }
});

app.post('/api/auth/deconnexion', requireAuth, async (req, res) => {
  const rToken = req.cookies?.refresh_token;
  if (rToken) await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [rToken]);
  clearAuthCookies(res);
  res.json({ message: 'Déconnecté.' });
});

// Routes Contact
app.post('/api/contact', async (req, res) => {
  const { nom, email, message } = req.body;
  if (!nom || !email || !message) return res.status(400).json({ success: false, error: 'Champs requis.' });
  try {
  await transport.sendMail({
    from: 'test@example.com',       // n'importe quelle adresse, Mailtrap capture l'email
    replyTo: email,                 // email de la personne qui remplit le formulaire
    to: 'inbox@mailtrap.io',        // ton inbox Mailtrap (ou n'importe quelle adresse, Mailtrap capture)
    subject: `Message de ${nom}`,
    html: `<h3>${nom} (${email})</h3><p>${message.replace(/\n/g, '<br>')}</p>`
  });

  res.json({ success: true });
} catch (error) {
  console.error('Erreur Mailtrap :', error);
  res.status(500).json({ success: false, error: error.message });
    }
});

// Routes Résultats (avec admin unifié)
app.post('/api/resultats', requireAuth, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.json({ success: false, message: 'Code manquant.' });
  try {
    const q = await pool.query('SELECT math, physique, info FROM resultats WHERE code_etudiant = $1 AND user_id = $2', [code, req.user.id]);
    if (q.rowCount === 0) return res.json({ success: false, message: 'Code introuvable.' });
    res.json({ success: true, notes: { Mathématiques: q.rows[0].math, Physique: q.rows[0].physique, Informatique: q.rows[0].info } });
  } catch (err) {
    logger.error(err);
    res.json({ success: false, message: 'Erreur DB.' });
  }
});

// Admin Notes (simple token in-memory, scalable via Redis en prod)
const ADMIN_CODE = process.env.ADMIN_CODE;
const tokens = new Map();  // Token -> expire (en prod: Redis)
const TOKEN_TTL = 3600000;  // 1h
function createAdminToken() {
  const t = nanoid(32);
  tokens.set(t, Date.now() + TOKEN_TTL);
  return t;
}
function verifyAdminToken(t) {
  if (!t || !tokens.has(t) || Date.now() > tokens.get(t)) {
    tokens.delete(t);
    return false;
  }
  tokens.set(t, Date.now() + TOKEN_TTL);
  return true;
}
setInterval(() => { for (const [t, exp] of tokens) if (Date.now() > exp) tokens.delete(t); }, 600000);  // Cleanup

app.post('/api/admin/login', (req, res) => {
  const { code } = req.body;
  if (code !== ADMIN_CODE) return res.json({ success: false, message: 'Code invalide.' });
  const token = createAdminToken();
  res.json({ success: true, token });
});

app.post('/api/admin/save-notes', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.json({ success: false, message: 'Token admin invalide.', code: 'INVALID_TOKEN' });
  const { code, math, physique, info, moyenne } = req.body;
  if (!code || math === undefined || physique === undefined || info === undefined) return res.json({ success: false, message: 'Données incomplètes.' });
  const m = moyenne ? parseFloat(moyenne) : (parseFloat(math) + parseFloat(physique) + parseFloat(info)) / 3;
  try {
    await pool.query(
      'INSERT INTO resultats (user_id, code_etudiant, math, physique, info, moyenne) VALUES ((SELECT id FROM users LIMIT 1), $1, $2, $3, $4, $5) ON CONFLICT (code_etudiant) DO UPDATE SET math=$2, physique=$3, info=$4, moyenne=$5, updated_at=NOW()',
      [code, math, physique, info, Math.round(m * 100) / 100]
    );
    res.json({ success: true, message: 'Notes sauvées.' });
  } catch (err) {
    logger.error(err);
    res.json({ success: false, message: 'Erreur DB.' });
  }
});

// Routes Quiz (unifiées avec auth)
app.post('/api/quiz/:quizName', requireAuth, quizLimiter, async (req, res) => {
  const { quizName } = req.params;
  const userAnswers = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const quizRes = await client.query('SELECT id FROM quizzes WHERE name=$1', [quizName]);
      if (quizRes.rowCount === 0) throw new Error('Quiz inconnu.');
      const quizId = quizRes.rows[0].id;
      const questionsRes = await client.query('SELECT key_name, correct_index, explanation FROM questions WHERE quiz_id=$1', [quizId]);
      let bonnes = 0;
      const total = questionsRes.rowCount;
      for (const q of questionsRes.rows) {
        const isCorrect = userAnswers[q.key_name] == q.correct_index;
        if (isCorrect) bonnes++;
        await client.query('INSERT INTO quiz_sessions (user_id, quiz_id, question_id, user_answer, correct, completion_time) VALUES ($1, $2, $3, $4, $5, 10)',  // Temps fictif, ajustez
          [req.user.id, quizId, q.id, userAnswers[q.key_name], isCorrect]);
      }
      await client.query('INSERT INTO scores (user_id, quiz_id, score) VALUES ($1, $2, $3) ON CONFLICT (user_id, quiz_id) DO UPDATE SET score = scores.score + $3', [req.user.id, quizId, bonnes]);
      await client.query('COMMIT');
      res.send(`Bonne${bonnes > 1 ? 's' : ''} : ${bonnes}/${total}. Score cumulé mis à jour.`);
    } finally { client.release(); }
  } catch (err) {
    logger.error(err);
    res.status(500).send('Erreur serveur.');
  }
});

// Routes Dashboard (stats, classement, progression, quizzes CRUD)
app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM quizzes) as totalQuiz,
        (SELECT COUNT(*) FROM scores) as totalScores,
        AVG(completion_time) as avgTime FROM quiz_sessions
    `);
    const monthly = await pool.query('SELECT date_trunc(\'month\', completed_at) as month, AVG(score) as avg FROM scores GROUP BY month ORDER BY month');
    res.json({
      totalUsers: stats.rows[0].totalusers,
      totalQuiz: stats.rows[0].totalquiz,
      totalScores: stats.rows[0].totalscores,
      avgTime: Math.round(stats.rows[0].avgtime || 0),
      monthlyLabels: monthly.rows.map(r => r.month.toISOString().slice(0,7)),
      monthlyScores: monthly.rows.map(r => Math.round(r.avg || 0))
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur stats.' });
  }
});

app.get('/api/dashboard/classement', requireAuth, async (req, res) => {
  const { matiere } = req.query;
  const where = matiere ? 'WHERE q.matiere = $1' : '';
  try {
    const classement = await pool.query(`
      SELECT u.name, SUM(s.score) as score, u.xp,
        (SELECT string_agg(b.name, ', ') FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = u.id) as badges
      FROM users u LEFT JOIN scores s ON u.id = s.user_id LEFT JOIN quizzes q ON s.quiz_id = q.id
      ${where} GROUP BY u.id, u.name, u.xp ORDER BY score DESC LIMIT 50
    `, matiere ? [matiere] : []);
    res.json(classement.rows.map((row, idx) => ({ ...row, rank: idx + 1, badges: row.badges ? row.badges.split(', ') : [] })));
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur classement.' });
  }
});

app.get('/api/dashboard/progression', requireAuth, async (req, res) => {
  try {
    const user = await pool.query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
    const level = Math.floor((user.rows[0]?.xp || 0) / 100) + 1;
    const badges = await pool.query('SELECT b.name FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = $1', [req.user.id]);
    const feedbacks = await pool.query(`
      SELECT q.question, qs.user_answer, qs.correct, q.explanation
      FROM quiz_sessions qs JOIN questions q ON qs.question_id = q.id
      WHERE qs.user_id = $1 ORDER BY qs.completed_at DESC LIMIT 5
    `, [req.user.id]);
    const matieres = await pool.query('SELECT q.matiere, AVG(s.score) as avg FROM scores s JOIN quizzes q ON s.quiz_id = q.id WHERE s.user_id = $1 GROUP BY q.matiere', [req.user.id]);
    res.json({
      xp: user.rows[0]?.xp || 0,
      level,
      levelName: level === 1 ? 'Débutant' : level < 5 ? 'Intermédiaire' : 'Expert',
      badges: badges.rows.map(r => r.name),
      feedbacks: feedbacks.rows,
      matiereLabels: matieres.rows.map(r => r.matiere),
      matiereScores: matieres.rows.map(r => Math.round(r.avg || 0))
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur progression.' });
  }
});

app.get('/api/dashboard/quizzes', requireAuth, async (req, res) => {
  try {
    const quizzes = await pool.query(`
      SELECT q.id, q.name, q.matiere, COUNT(que.id) as questions_count,
        json_agg(json_build_object('key_name', que.key_name, 'question', que.question, 'options', que.options, 'correct_index', que.correct_index, 'explanation', que.explanation)) as questions
      FROM quizzes q LEFT JOIN questions que ON q.id = que.quiz_id WHERE q.created_by = $1 GROUP BY q.id
    `, [req.user.id]);
    res.json(quizzes.rows.map(r => ({ ...r, questions: r.questions || [] })));
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur quizzes.' });
  }
});

app.post('/api/dashboard/quizzes', requireAuth, async (req, res) => {
  try {
    const { name, matiere, questions } = req.body;
    const insertQuiz = await pool.query('INSERT INTO quizzes (name, matiere, created_by) VALUES ($1, $2, $3) RETURNING id', [name, matiere, req.user.id]);
    const quizId = insertQuiz.rows[0].id;
    for (const q of questions) {
      await pool.query(
        'INSERT INTO questions (quiz_id, key_name, question, options, correct_index, explanation) VALUES ($1, $2, $3, $4, $5, $6)',
        [quizId, q.key_name || `q${quizId}`, q.question, JSON.stringify(q.options), q.correct, q.explanation || '']
      );
    }
    res.json({ success: true, id: quizId });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur création.' });
  }
});

app.put('/api/dashboard/quizzes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, matiere, questions } = req.body;
    await pool.query('UPDATE quizzes SET name=$1, matiere=$2 WHERE id=$1 AND created_by=$3', [id, name, matiere, req.user.id]);
    await pool.query('DELETE FROM questions WHERE quiz_id=$1', [id]);
    for (const q of questions) {
      await pool.query(
        'INSERT INTO questions (quiz_id, key_name, question, options, correct_index, explanation) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, q.key_name, q.question, JSON.stringify(q.options), q.correct, q.explanation || '']
      );
    }
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur update.' });
  }
});

app.delete('/api/dashboard/quizzes/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM quizzes WHERE id=$1 AND created_by=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur suppression.' });
  }
});

// Static Files (servir React build en prod, dev: proxy)
// app.use(express.static(path.join(__dirname, '../frontend/dist')));  // Build React ici
// app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
transporter.verify((error, success) => {
  if (error) console.error('❌ SMTP non fonctionnel :', error);
  else console.log('✅ SMTP prêt à envoyer les emails');
});

app.listen(PORT, () => logger.info(`Serveur unifié sur http://localhost:${PORT}`));
