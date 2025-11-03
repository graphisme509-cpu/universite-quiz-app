import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import pino from 'pino';
import pinoHttp from 'pino-http';
import promClient from 'prom-client';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
app.use(pinoHttp({ logger }));

// DB Pool (scalabilité)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.set('trust proxy', 1); // fait confiance au proxy de la plateforme

// Middlewares Sécurité/Scalabilité
app.use(helmet());
app.use(cors({
  origin: ['https://universite-quiz-app.vercel.app'], // 🔒 domaine précis du front
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Rate Limits
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const quizLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);
app.use('/api/quiz', quizLimiter);

// Prometheus (monitoring)
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Utils
const normalizeEmail = (email) => email.trim().toLowerCase();
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
const ACCESS_TOKEN_TTL_MIN = process.env.ACCESS_TOKEN_TTL_MIN || 15;
const REFRESH_TOKEN_TTL_DAYS = process.env.REFRESH_TOKEN_TTL_DAYS || 7;

function signAccessToken(user) { return jwt.sign({ sub: String(user.id), email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: `${ACCESS_TOKEN_TTL_MIN}m` }); }
function signRefreshToken(user) { return jwt.sign({ sub: String(user.id) }, process.env.JWT_REFRESH_SECRET, { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` }); }

function setAuthCookies(res, access, refresh) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', access, { 
    httpOnly: true, 
    secure: true,
    path: '/',
    sameSite: 'none',  // ⚠️ change ici
    maxAge: ACCESS_TOKEN_TTL_MIN * 6000 * 1000 
  });
  res.cookie('refresh_token', refresh, { 
    httpOnly: true, 
    secure: true,
    path: '/',
    sameSite: 'none',  // ⚠️ change ici
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000 
  });
}

function clearAuthCookies(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('access_token', { httpOnly: true, path: '/', secure: true, sameSite: 'none' });
  res.clearCookie('refresh_token', { httpOnly: true, path: '/', secure: true, sameSite: 'none' });
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
    const passwordHash = await bcrypt.hash(motdepasse, 12);
    const insert = await pool.query(
      'INSERT INTO users (name, email, password_hash, email_verified) VALUES ($1, $2, $3, TRUE) RETURNING id, name, email, created_at',
      [nom, emailNorm, passwordHash]
    );
    const user = insert.rows[0];
    res.status(201).json({ message: 'Inscription OK.', user: {id: user.id, name: user.name, email: user.email} });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Email utilisé.' });
    logger.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/auth/connexion', async (req, res) => {
  try {
    const { email, motdepasse } = loginSchema.parse(req.body);
    const emailNorm = normalizeEmail(email);
    const q = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [emailNorm]);
    if (q.rowCount === 0 || !await bcrypt.compare(motdepasse, q.rows[0].password_hash)) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }
    const user = q.rows[0];
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshExp = daysFromNow(REFRESH_TOKEN_TTL_DAYS);
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
    if (q.rowCount === 0 || new Date(q.rows[0].expires_at) < new Date()) {
        if(q.rowCount > 0) await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [rToken]);
        return res.status(401).json({ message: 'Refresh invalide.' });
    }
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [rToken]);
    const user = q.rows[0];
    const newRefresh = signRefreshToken(user);
    const newAccess = signAccessToken(user);
    const refreshExp = daysFromNow(REFRESH_TOKEN_TTL_DAYS);
    await pool.query('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)', [newRefresh, user.id, refreshExp]);
    setAuthCookies(res, newAccess, newRefresh);
    res.json({ message: 'Rafraîchi.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Erreur.' });
  }
});

app.get('/api/auth/session', requireAuth, (req, res) => {
    res.json({ user: req.user });
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
  logger.info({ contactForm: { nom, email, message } }, 'Nouveau message de contact reçu');
  res.json({ success: true });
});

// Routes Résultats 
// Pour un code étudiant spécifique (ex: recherche publique)
// Pour un code étudiant spécifique (ex: recherche publique)
// Route POST /api/resultats : Recherche par code étudiant (publique, mais auth required)
// Route POST /api/resultats : Recherche par code étudiant (publique, mais auth required)
// Route POST /api/resultats : Recherche par code étudiant (publique, mais auth required)
// Route POST /api/resultats : Recherche par code étudiant (publique, mais auth required)
// Route POST /api/resultats : Recherche par code étudiant (publique, mais auth required)

app.post('/api/resultats', requireAuth, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Code manquant.' });
  try {
    let years = [];
    let option = '';
    const periodNames = { 1: '1ère période', 2: '2ème période', 3: '3ème période' };
    const academicYears = { 1: '2022-2023', 2: '2023-2024', 3: '2024-2025' };
    const classes = { 1: '1ère année', 2: '2ème année', 3: '3ème année' };
    let userId = null;

    // Trouver le premier enregistrement pour obtenir user_id
    for (let a = 1; a <= 3 && !userId; a++) {
      for (let p = 1; p <= 3 && !userId; p++) {
        const table = `resultats_${a}_${p}`;
        const q = await pool.query(`SELECT user_id, notes, moyenne FROM ${table} WHERE code_etudiant = $1`, [code]);
        if (q.rowCount > 0) {
          userId = q.rows[0].user_id;
          break;
        }
      }
    }

    if (!userId) return res.status(404).json({ success: false, message: 'Aucun résultat trouvé pour ce code.' });

    // Récupérer l'option de l'utilisateur
    const userQ = await pool.query('SELECT option FROM users WHERE id = $1', [userId]);
    if (userQ.rowCount === 0) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    option = userQ.rows[0].option || '';

    // Interroger toutes les tables pour les 3 années, inclure même si pas de notes (moyenne=0 si pas de ligne)
    for (let a = 1; a <= 3; a++) {
      let periods = [];
      for (let p = 1; p <= 3; p++) {
        const table = `resultats_${a}_${p}`;
        const q = await pool.query(`SELECT notes, moyenne FROM ${table} WHERE code_etudiant = $1`, [code]);
        let notesObj = {};
        let moyenne = 0;
        if (q.rowCount > 0) {
          notesObj = q.rows[0].notes || {};
          moyenne = parseFloat(q.rows[0].moyenne) || 0;

          // Calculer moyenne si non fournie ou incohérente
          const noteValues = Object.values(notesObj).map(n => typeof n === 'number' ? n : 0);
          const calculatedMoy = noteValues.length > 0 ? noteValues.reduce((acc, val) => acc + val, 0) / noteValues.length : 0;
          if (moyenne === 0 || Math.abs(moyenne - calculatedMoy) > 0.01) {
            moyenne = calculatedMoy;
          }
        }
        periods.push({
          periode: p,
          title: periodNames[p],
          notes: notesObj,
          moyenne: moyenne
        });
      }
      if (periods.some(p => Object.keys(p.notes).length > 0 || p.moyenne > 0)) {
        years.push({
          annee: a,
          academicYear: academicYears[a],
          classe: classes[a],
          periods: periods.sort((a, b) => a.periode - b.periode)
        });
      }
    }

    res.json({ success: true, results: { option, years } });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: 'Erreur DB.' });
  }
});

app.get('/api/resultats', requireAuth, async (req, res) => {
  try {
    // Récupérer l'option de l'utilisateur
    const userQ = await pool.query('SELECT option FROM users WHERE id = $1', [req.user.id]);
    if (userQ.rowCount === 0) return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    const option = userQ.rows[0].option || '';

    let years = [];
    const periodNames = { 1: '1ère période', 2: '2ème période', 3: '3ème période' };
    const academicYears = { 1: '2022-2023', 2: '2023-2024', 3: '2024-2025' };
    const classes = { 1: '1ère année', 2: '2ème année', 3: '3ème année' };

    // Interroger toutes les tables pour les 3 années, inclure même si pas de notes (moyenne=0 si pas de ligne)
    for (let a = 1; a <= 3; a++) {
      let periods = [];
      for (let p = 1; p <= 3; p++) {
        const table = `resultats_${a}_${p}`;
        const q = await pool.query(`SELECT notes, moyenne FROM ${table} WHERE user_id = $1`, [req.user.id]);
        let notesObj = {};
        let moyenne = 0;
        if (q.rowCount > 0) {
          notesObj = q.rows[0].notes || {};
          moyenne = parseFloat(q.rows[0].moyenne) || 0;

          // Calculer moyenne si non fournie ou incohérente
          const noteValues = Object.values(notesObj).map(n => typeof n === 'number' ? n : 0);
          const calculatedMoy = noteValues.length > 0 ? noteValues.reduce((acc, val) => acc + val, 0) / noteValues.length : 0;
          if (moyenne === 0 || Math.abs(moyenne - calculatedMoy) > 0.01) {
            moyenne = calculatedMoy;
          }
        }
        periods.push({
          periode: p,
          title: periodNames[p],
          notes: notesObj,
          moyenne: moyenne
        });
      }
      if (periods.some(p => Object.keys(p.notes).length > 0 || p.moyenne > 0)) {
        years.push({
          annee: a,
          academicYear: academicYears[a],
          classe: classes[a],
          periods: periods.sort((a, b) => a.periode - b.periode)
        });
      }
    }

    res.json({ success: true, results: { option, years } });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: 'Erreur DB.' });
  }
});

// Admin Notes
const ADMIN_CODE = process.env.ADMIN_CODE;
const tokens = new Map();
const TOKEN_TTL = 3600000;
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
setInterval(() => { for (const [t, exp] of tokens) if (Date.now() > exp) tokens.delete(t); }, 600000);

app.post('/api/admin/login', (req, res) => {
  const { code } = req.body;
  if (code !== ADMIN_CODE) return res.json({ success: false, message: 'Code invalide.' });
  const token = createAdminToken();
  res.json({ success: true, token });
});

app.post('/api/admin/save-notes', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token admin invalide.', code: 'INVALID_TOKEN' });
  const { code, math, physique, info, moyenne } = req.body;
  if (!code || math === undefined || physique === undefined || info === undefined) return res.status(400).json({ success: false, message: 'Données incomplètes.' });
  const m = moyenne ? parseFloat(moyenne) : (parseFloat(math) + parseFloat(physique) + parseFloat(info)) / 3;
  try {
    await pool.query(
      'INSERT INTO resultats (code_etudiant, math, physique, info, moyenne) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code_etudiant) DO UPDATE SET math=$2, physique=$3, info=$4, moyenne=$5, updated_at=NOW()',
      [code, math, physique, info, Math.round(m * 100) / 100]
    );
    res.json({ success: true, message: 'Notes sauvées.' });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: 'Erreur DB.' });
  }
});

// server.js (correction dans la route /api/quiz/:quizName)
app.post('/api/quiz/:quizName', requireAuth, quizLimiter, async (req, res) => {
  const { quizName } = req.params;
  const { answers: userAnswers } = req.body;  // Correction : extraire 'answers' du body
  const client = await pool.connect();
  try {
      await client.query('BEGIN');
      const quizRes = await client.query('SELECT id FROM quizzes WHERE name=$1', [quizName]);
      if (quizRes.rowCount === 0) throw new Error('Quiz inconnu.');
      const quizId = quizRes.rows[0].id;
      const questionsRes = await client.query('SELECT id, key_name, correct_index FROM questions WHERE quiz_id=$1', [quizId]);
      let bonnes = 0;
      const total = questionsRes.rowCount;
      for (const q of questionsRes.rows) {
        const userAnswerIndex = userAnswers[q.key_name] ?? -1;  // Correction : gérer l'absence de réponse (défaut -1)
        const isCorrect = userAnswerIndex == q.correct_index;
        if (isCorrect) bonnes++;
        // Correction : ajuster la requête pour 6 paramètres ($1 à $6) et VALUES avec $6 pour completion_time
        await client.query('INSERT INTO quiz_sessions (user_id, quiz_id, question_id, user_answer, correct, completion_time) VALUES ($1, $2, $3, $4, $5, $6)',
          [req.user.id, quizId, q.id, String(userAnswerIndex), isCorrect, 10]);
      }
      await client.query('INSERT INTO scores (user_id, quiz_id, score) VALUES ($1, $2, $3)', [req.user.id, quizId, bonnes]);
      await client.query('COMMIT');
      res.send(`Bonne${bonnes > 1 ? 's' : ''} : ${bonnes}/${total}. Score enregistré.`);
    } catch(err) {
        await client.query('ROLLBACK');
        logger.error(err);
        res.status(500).send('Erreur serveur.');
    } finally {
        client.release();
    }
});

// Routes Dashboard

// Middleware anti-cache pour toutes les routes du dashboard
app.use('/api/dashboard', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM quizzes) as totalQuiz,
        (SELECT COUNT(*) FROM scores) as totalScores,
        AVG(completion_time) as avgTime FROM quiz_sessions
    `);
    const monthly = await pool.query("SELECT to_char(date_trunc('month', completed_at), 'YYYY-MM') as month, AVG(score) as avg FROM scores GROUP BY month ORDER BY month");
    res.json({
      totalUsers: stats.rows[0].totalusers,
      totalQuiz: stats.rows[0].totalquiz,
      totalScores: stats.rows[0].totalscores,
      avgTime: Math.round(stats.rows[0].avgtime || 0),
      monthlyLabels: monthly.rows.map(r => r.month),
      monthlyScores: monthly.rows.map(r => parseFloat(r.avg || 0).toFixed(2))
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur stats.' });
  }
});

app.get('/api/dashboard/classement', requireAuth, async (req, res) => {
  try {
    const classement = await pool.query(`
      SELECT u.name, COALESCE(SUM(s.score), 0) as score, u.xp,
        (SELECT string_agg(b.name, ', ') FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = u.id) as badges
      FROM users u LEFT JOIN scores s ON u.id = s.user_id
      GROUP BY u.id, u.name, u.xp ORDER BY score DESC, xp DESC LIMIT 50
    `);
    res.json(classement.rows.map((row, idx) => ({ ...row, rank: idx + 1, badges: row.badges ? row.badges.split(', ') : [] })));
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur classement.' });
  }
});

app.get('/api/dashboard/progression', requireAuth, async (req, res) => {
  try {
    const user = await pool.query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
    const xp = user.rows[0]?.xp || 0;
    const level = Math.floor(xp / 100) + 1;
    const badges = await pool.query('SELECT b.name FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = $1', [req.user.id]);
    const feedbacks = await pool.query(`
      SELECT q.question, qs.user_answer, qs.correct, q.explanation
      FROM quiz_sessions qs JOIN questions q ON qs.question_id = q.id
      WHERE qs.user_id = $1 ORDER BY qs.completed_at DESC LIMIT 5
    `, [req.user.id]);
    const matieres = await pool.query('SELECT q.matiere, AVG(s.score) as avg FROM scores s JOIN quizzes q ON s.quiz_id = q.id WHERE s.user_id = $1 GROUP BY q.matiere', [req.user.id]);
    res.json({
      xp: xp,
      level,
      levelName: level < 2 ? 'Novice' : level < 5 ? 'Apprenti' : level < 10 ? 'Connaisseur' : 'Maître',
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

// Renvoie TOUS les quiz pour que les utilisateurs puissent les passer
app.get('/api/dashboard/quizzes', requireAuth, async (req, res) => {
  try {
    const quizzes = await pool.query(`
      SELECT q.id, q.name, q.matiere, COUNT(que.id)::int as questions_count,
        json_agg(json_build_object('key_name', que.key_name, 'question', que.question, 'options', que.options, 'correct_index', que.correct_index, 'explanation', que.explanation)) as questions
      FROM quizzes q LEFT JOIN questions que ON q.id = que.quiz_id GROUP BY q.id ORDER BY q.name
    `);
    res.json(quizzes.rows.map(r => ({ ...r, questions: r.questions[0] === null ? [] : r.questions })));
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur quizzes.' });
  }
});


// Servir le front-end
// app.use(express.static(path.join(__dirname, '../dist')));
// app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, '../dist/index.html'));
// });

app.listen(PORT, () => logger.info(`Serveur unifié sur http://localhost:${PORT}`));
