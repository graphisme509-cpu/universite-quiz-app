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

// Fonctions pour badges (appelées après soumission quiz)
async function awardSingleBadge(pool, userId, badgeName) {
  try {
    const badgeRes = await pool.query('SELECT id FROM badges WHERE name ILIKE $1', [badgeName]);
    if (badgeRes.rowCount === 0) return;
    const badgeId = badgeRes.rows[0].id;
    const existsRes = await pool.query('SELECT 1 FROM user_badges WHERE user_id=$1 AND badge_id=$2', [userId, badgeId]);
    if (existsRes.rowCount === 0) {
      await pool.query('INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)', [userId, badgeId]);
    }
  } catch (err) {
    logger.error('Erreur attribution badge:', err);
  }
}

async function awardBadges(userId, quizId, score, totalQuestions) {
  try {
    // Récupérer l'XP mis à jour (après trigger sur scores)
    const xpRes = await pool.query('SELECT xp FROM users WHERE id=$1', [userId]);
    const xp = xpRes.rows[0]?.xp || 0;

    // Attribution basée sur seuils XP (cumulatif, seulement si pas déjà possédé)
    if (xp >= 1) {
      await awardSingleBadge(pool, userId, 'Débutant');
    }
    if (xp >= 1000) {
      await awardSingleBadge(pool, userId, 'Amateur');
    }
    if (xp >= 2000) {
      await awardSingleBadge(pool, userId, 'Pro');
    }
    if (xp >= 3000) {
      await awardSingleBadge(pool, userId, 'Expert');
    }
    if (xp >= 4000) {
      await awardSingleBadge(pool, userId, 'Maître');
    }
  } catch (err) {
    logger.error('Erreur awardBadges:', err);
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

app.get('/api/auth/session', requireAuth, async (req, res) => {
  try {
    const userFull = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    if (userFull.rowCount === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: userFull.rows[0] });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Error fetching user.' });
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
  logger.info({ contactForm: { nom, email, message } }, 'Nouveau message de contact reçu');
  res.json({ success: true });
});

// New Settings Endpoint (public, no auth)
app.get('/api/settings/synthese-visible', async (req, res) => {
  try {
    const q = await pool.query('SELECT setting_value FROM app_settings WHERE setting_key = $1', ['synthese_visible']);
    const visible = q.rowCount > 0 ? q.rows[0].setting_value : true; // Default to visible
    res.json({ visible });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du paramètre.' });
  }
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
    let userId = null;
    const periodNames = { 1: '1ère période', 2: '2ème période', 3: '3ème période' };
    const academicYears = { 1: '2022-2023', 2: '2023-2024', 3: '2024-2025' };
    const classes = { 1: '1ère année', 2: '2ème année', 3: '3ème année' };

    // Interroger toutes les tables pour les 3 années, inclure même si pas de notes (moyenne=0 si pas de ligne)
    for (let a = 1; a <= 3; a++) {
      let yearAcademicYear = academicYears[a];
      let periods = [];
      for (let p = 1; p <= 3; p++) {
        const table = `resultats_${a}_${p}`;
        const q = await pool.query(`SELECT user_id, notes, moyenne, option, academic_year FROM ${table} WHERE code_etudiant = $1`, [code]);
        let notesObj = {};
        let moyenne = 0;
        if (q.rowCount > 0) {
          notesObj = q.rows[0].notes || {};
          moyenne = parseFloat(q.rows[0].moyenne) || 0;

          if (q.rows[0].user_id && !userId) {
            userId = q.rows[0].user_id;
          }
          if (q.rows[0].user_id === null && !option && q.rows[0].option) {
            option = q.rows[0].option;
          }
          if (q.rows[0].academic_year && yearAcademicYear === academicYears[a]) {
            yearAcademicYear = q.rows[0].academic_year;
          }

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
          academicYear: yearAcademicYear,
          classe: classes[a],
          periods: periods.sort((a, b) => a.periode - b.periode)
        });
      }
    }

    if (years.length === 0) return res.status(404).json({ success: false, message: 'Aucun résultat trouvé pour ce code.' });

    if (userId) {
      const userQ = await pool.query('SELECT option FROM users WHERE id = $1', [userId]);
      if (userQ.rowCount === 0) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
      option = userQ.rows[0].option || '';
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

// New Admin Toggle Endpoint
app.post('/api/admin/toggle-synthese', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token admin invalide.' });
  const { visible } = req.body;
  if (visible === undefined) return res.status(400).json({ success: false, message: 'Valeur visible manquante.' });
  try {
    await pool.query(
      'INSERT INTO app_settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2',
      ['synthese_visible', !!visible]
    );
    res.json({ success: true, visible: !!visible });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour.' });
  }
});

// Routes Admin Kindergarten

app.get('/api/admin/eleves-kind', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  try {
    const q = await pool.query('SELECT id, nom, prenom FROM eleves_kind ORDER BY LOWER(nom), LOWER(prenom)');
    res.json(q.rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

// New: Get all élèves with full details, sorted by nom
app.get('/api/admin/all-eleves-kind', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  try {
    const q = await pool.query(`
      SELECT id, nom, prenom, sexe, date_naissance, lieu_naissance, classe, adresse,
             personne_responsable_cin, nom_responsable, prenom_responsable, tel_responsable,
             enseignant_cin, nom_enseignant, prenom_enseignant
      FROM eleves_kind ORDER BY LOWER(nom), LOWER(prenom)
    `);
    res.json(q.rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.get('/api/admin/eleve-kind/:id', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const { id } = req.params;
  try {
    const q = await pool.query('SELECT * FROM eleves_kind WHERE id = $1', [id]);
    if (q.rowCount === 0) return res.status(404).json({ success: false, message: 'Élève non trouvé.' });
    res.json(q.rows[0]);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/admin/add-eleve-kind', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const {
    nom, prenom, sexe, date_naissance, lieu_naissance, classe, adresse,
    personne_responsable_cin, nom_responsable, prenom_responsable, tel_responsable,
    enseignant_cin, nom_enseignant, prenom_enseignant
  } = req.body;
  if (!nom || !prenom || !sexe || !date_naissance || !lieu_naissance || !classe || !adresse ||
      !personne_responsable_cin || !nom_responsable || !prenom_responsable || !tel_responsable ||
      !enseignant_cin || !nom_enseignant || !prenom_enseignant) {
    return res.status(400).json({ success: false, message: 'Données incomplètes.' });
  }
  try {
    const insert = await pool.query(
      `INSERT INTO eleves_kind (nom, prenom, sexe, date_naissance, lieu_naissance, classe, adresse,
       personne_responsable_cin, nom_responsable, prenom_responsable, tel_responsable,
       enseignant_cin, nom_enseignant, prenom_enseignant)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [nom, prenom, sexe, date_naissance, lieu_naissance, classe, adresse, personne_responsable_cin,
       nom_responsable, prenom_responsable, tel_responsable, enseignant_cin, nom_enseignant, prenom_enseignant]
    );
    res.json({ success: true, id: insert.rows[0].id });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: 'Erreur DB.' });
  }
});

app.post('/api/admin/update-field-eleve-kind', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const { id, field, value } = req.body;
  if (!id || !field || value === undefined) return res.status(400).json({ success: false, message: 'Données incomplètes.' });
  try {
    await pool.query(`UPDATE eleves_kind SET ${field} = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.delete('/api/admin/eleve-kind/:id', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM eleves_kind WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.get('/api/admin/infos-ecole-kind', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  try {
    const q = await pool.query('SELECT * FROM infos_ecole_kind LIMIT 1');
    res.json(q.rows[0] || {});
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/admin/update-infos-ecole-kind', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const { annee_academique, ecole, directeur, telephone, zone, inspecteur_zone } = req.body;
  try {
    await pool.query(
      `INSERT INTO infos_ecole_kind (annee_academique, ecole, directeur, telephone, zone, inspecteur_zone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
       annee_academique = $1, ecole = $2, directeur = $3, telephone = $4, zone = $5, inspecteur_zone = $6
       WHERE infos_ecole_kind.id = 1`,
      [annee_academique, ecole, directeur, telephone, zone, inspecteur_zone]
    );
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

// Routes Admin Normale

// Routes Admin Normale

app.get('/api/admin/etudiantes-normale', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  try {
    const q = await pool.query('SELECT id, nom, prenom FROM etudiantes_normale ORDER BY LOWER(nom), LOWER(prenom)');
    res.json(q.rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

// Get all étudiantes with full details, sorted by nom
app.get('/api/admin/all-etudiantes-normale', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  try {
    const q = await pool.query(`
      SELECT id, nom, prenom, option, sexe, date_naissance, commune,
             nom_derniere_ecole, district_derniere_ecole, derniere_classe,
             annee_derniere_ecole, mention_derniere_ecole, classe_actuelle,
             annee_academique, code_etudiante
      FROM etudiantes_normale ORDER BY LOWER(nom), LOWER(prenom)
    `);
    res.json(q.rows);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.get('/api/admin/etudiante-normale/:id', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const { id } = req.params;
  try {
    const q = await pool.query('SELECT * FROM etudiantes_normale WHERE id = $1', [id]);
    if (q.rowCount === 0) return res.status(404).json({ success: false, message: 'Étudiante non trouvée.' });
    res.json(q.rows[0]);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/admin/add-etudiante-normale', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const {
    nom, prenom, option, sexe, date_naissance, commune,
    nom_derniere_ecole, district_derniere_ecole, derniere_classe,
    annee_derniere_ecole, mention_derniere_ecole, classe_actuelle,
    annee_academique, code_etudiante
  } = req.body;
  if (!nom || !prenom || !option || !sexe || !date_naissance || !commune ||
      !nom_derniere_ecole || !district_derniere_ecole || !derniere_classe ||
      !annee_derniere_ecole || !mention_derniere_ecole || !classe_actuelle ||
      !annee_academique || !code_etudiante) {
    return res.status(400).json({ success: false, message: 'Données incomplètes.' });
  }
  try {
    const insert = await pool.query(
      `INSERT INTO etudiantes_normale (nom, prenom, option, sexe, date_naissance, commune,
       nom_derniere_ecole, district_derniere_ecole, derniere_classe,
       annee_derniere_ecole, mention_derniere_ecole, classe_actuelle,
       annee_academique, code_etudiante)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [nom, prenom, option, sexe, date_naissance, commune,
       nom_derniere_ecole, district_derniere_ecole, derniere_classe,
       annee_derniere_ecole, mention_derniere_ecole, classe_actuelle,
       annee_academique, code_etudiante]
    );
    res.json({ success: true, id: insert.rows[0].id });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: 'Erreur DB.' });
  }
});

app.post('/api/admin/update-field-etudiante-normale', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const { id, field, value } = req.body;
  if (!id || !field || value === undefined) return res.status(400).json({ success: false, message: 'Données incomplètes.' });
  try {
    await pool.query(`UPDATE etudiantes_normale SET ${field} = $1, updated_at = NOW() WHERE id = $2`, [value, id]);
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
  }
});

app.delete('/api/admin/etudiante-normale/:id', async (req, res) => {
  const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
  if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM etudiantes_normale WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false });
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

      // Attribution badges après COMMIT (dans un sous-try pour isoler les erreurs)
      try {
        await awardBadges(req.user.id, quizId, bonnes, total);
      } catch (badgeErr) {
        logger.error('Erreur lors de l\'attribution des badges:', badgeErr);
      }

      res.send(`Bonne${bonnes > 1 ? 's' : ''} : ${bonnes}/${total}. Score enregistré.`);
    } catch(err) {
        await client.query('ROLLBACK');
        logger.error(err);
        res.status(500).send('Erreur serveur.');
    } finally {
        client.release();
    }
});

// Nouvelle route pour score total historique d'un quiz utilisateur
app.get('/api/dashboard/user-quiz-total/:quizId', requireAuth, async (req, res) => {
  const { quizId } = req.params;
  try {
    const totalRes = await pool.query('SELECT COALESCE(SUM(score), 0) as total FROM scores WHERE user_id=$1 AND quiz_id=$2', [req.user.id, quizId]);
    res.json({ total: parseInt(totalRes.rows[0].total) });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur récupération total.' });
  }
});

// Nouvelle route pour détails d'un utilisateur (scores par quiz, badges, etc.)
app.get('/api/dashboard/user-details/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  try {
    const userRes = await pool.query('SELECT name, xp FROM users WHERE id=$1', [userId]);
    if (userRes.rowCount === 0) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    const user = userRes.rows[0];

    const totalScoreRes = await pool.query('SELECT COALESCE(SUM(score), 0) as total FROM scores WHERE user_id=$1', [userId]);
    const totalScore = parseInt(totalScoreRes.rows[0].total);

    const badgesRes = await pool.query(`
      SELECT string_agg(b.name, ', ') as badges
      FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = $1
    `, [userId]);
    const badges = badgesRes.rows[0]?.badges || '';

    const quizScoresRes = await pool.query(`
      SELECT q.name as "quizName", COALESCE(SUM(s.score), 0) as "score"
      FROM quizzes q LEFT JOIN scores s ON q.id = s.quiz_id AND s.user_id = $1
      GROUP BY q.id, q.name
      ORDER BY q.name
    `, [userId]);

    res.json({
      name: user.name,
      xp: user.xp,
      badges,
      quizScores: quizScoresRes.rows.map(row => ({ quizName: row.quizName, score: parseInt(row.score) }))
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: 'Erreur récupération détails utilisateur.' });
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
      SELECT u.id, u.name, COALESCE(SUM(s.score), 0) as score, u.xp,
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

// Routes nouvelles:

const classeToAnnee = {
 '1ère année': 1,
 '2ème année': 2,
 '3ème année': 3,
};
const periodeToNum = {
 '1ère période': 1,
 '2ème période': 2,
 '3ème période': 3,
};

app.get('/api/admin/matieres', async (req, res) => {
 const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
 if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
 try {
 const q = await pool.query('SELECT classe, periode, matieres FROM matieres_predefinies');
 res.json(q.rows);
 } catch (err) {
 logger.error(err);
 res.status(500).json({ success: false });
 }
});

app.post('/api/admin/matieres', async (req, res) => {
 const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
 if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
 const { classe, periode, matieres } = req.body;
 try {
 await pool.query(
 'INSERT INTO matieres_predefinies (classe, periode, matieres) VALUES ($1, $2, $3) ON CONFLICT (classe, periode) DO UPDATE SET matieres = $3',
 [classe, periode, matieres]
 );
 res.json({ success: true });
 } catch (err) {
 logger.error(err);
 res.status(500).json({ success: false });
 }
});

app.post('/api/admin/update-results', async (req, res) => {
 const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
 if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
 const { code, option, academicYear, classe, periode, notes } = req.body;
 if (!code || !classe || !periode) return res.status(400).json({ success: false, message: 'Données incomplètes.' });
 const annee = classeToAnnee[classe];
 const perNum = periodeToNum[periode];
 if (!annee || !perNum) return res.status(400).json({ success: false, message: 'Classe ou période invalide.' });
 const table = `resultats_${annee}_${perNum}`;
 const noteValues = Object.values(notes).map(Number);
 const moyenne = noteValues.length > 0 ? noteValues.reduce((a, b) => a + b, 0) / noteValues.length : 0;
 try {
 await pool.query(
 `INSERT INTO ${table} (code_etudiant, option, academic_year, notes, moyenne, user_id) VALUES ($1, $2, $3, $4, $5, NULL) ON CONFLICT (code_etudiant) DO UPDATE SET option=$2, academic_year=$3, notes=$4, moyenne=$5, updated_at=NOW()`,
 [code, option, academicYear, notes, moyenne]
 );
 res.json({ success: true });
 } catch (err) {
 logger.error(err);
 res.status(500).json({ success: false });
 }
});

app.get('/api/admin/students', async (req, res) => {
 const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
 if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
 try {
 const q = await pool.query(`
 SELECT DISTINCT code_etudiant FROM resultats_1_1
 UNION SELECT DISTINCT code_etudiant FROM resultats_1_2
 UNION SELECT DISTINCT code_etudiant FROM resultats_1_3
 UNION SELECT DISTINCT code_etudiant FROM resultats_2_1
 UNION SELECT DISTINCT code_etudiant FROM resultats_2_2
 UNION SELECT DISTINCT code_etudiant FROM resultats_2_3
 UNION SELECT DISTINCT code_etudiant FROM resultats_3_1
 UNION SELECT DISTINCT code_etudiant FROM resultats_3_2
 UNION SELECT DISTINCT code_etudiant FROM resultats_3_3
 `);
 res.json(q.rows.map(r => r.code_etudiant));
 } catch (err) {
 logger.error(err);
 res.status(500).json({ success: false });
 }
});

app.get('/api/admin/get-results', async (req, res) => {
 const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
 if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
 const { code } = req.query;
 if (!code) return res.status(400).json({ success: false, message: 'Code manquant.' });
 // Le code ici est similaire à app.post('/api/resultats', ...) mais sans requireAuth, et avec query au lieu de body.
 // Pour éviter duplication, vous pouvez extraire la logique en fonction, mais comme demandé "nouvelles routes", voici le code (copié/adapté).
 try {
 let years = [];
 let option = '';
 const periodNames = { 1: '1ère période', 2: '2ème période', 3: '3ème période' };
 const academicYears = { 1: '2022-2023', 2: '2023-2024', 3: '2024-2025' };
 const classes = { 1: '1ère année', 2: '2ème année', 3: '3ème année' };
 let userId = null;
 let firstOption = '';
 let firstAcademic = new Map();

 for (let a = 1; a <= 3 && !userId; a++) {
 for (let p = 1; p <= 3 && !userId; p++) {
 const table = `resultats_${a}_${p}`;
 const q = await pool.query(`SELECT user_id, notes, moyenne, option, academic_year FROM ${table} WHERE code_etudiant = $1`, [code]);
 if (q.rowCount > 0) {
 userId = q.rows[0].user_id;
 if (!firstOption) firstOption = q.rows[0].option || '';
 firstAcademic.set(a, q.rows[0].academic_year || academicYears[a]);
 }
 }
 }

 if (!firstOption && !userId) return res.status(404).json({ success: false, message: 'Aucun résultat trouvé.' });

 if (userId) {
 const userQ = await pool.query('SELECT option FROM users WHERE id = $1', [userId]);
 option = userQ.rowCount > 0 ? userQ.rows[0].option || '' : firstOption;
 } else {
 option = firstOption;
 }

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
 const noteValues = Object.values(notesObj).map(Number);
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
 academicYear: firstAcademic.get(a),
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

app.post('/api/admin/update-field', async (req, res) => {
 const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
 if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
 const { code, field, value, annee, periode, matiere } = req.body;
 if (!code || !field) return res.status(400).json({ success: false });
 try {
 if (field === 'note') {
 if (!annee || !periode || !matiere) return res.status(400).json({ success: false });
 const table = `resultats_${annee}_${periode}`;
 const q = await pool.query(`SELECT notes FROM ${table} WHERE code_etudiant = $1`, [code]);
 let currentNotes = q.rowCount > 0 ? q.rows[0].notes || {} : {};
 currentNotes[matiere] = Number(value);
 const noteValues = Object.values(currentNotes).map(Number);
 const moyenne = noteValues.length > 0 ? noteValues.reduce((a, b) => a + b, 0) / noteValues.length : 0;
 await pool.query(`UPDATE ${table} SET notes = $1, moyenne = $2, updated_at=NOW() WHERE code_etudiant = $3`, [currentNotes, moyenne, code]);
 } else if (field === 'option') {
 for (let a = 1; a <= 3; a++) {
 for (let p = 1; p <= 3; p++) {
 const table = `resultats_${a}_${p}`;
 await pool.query(`UPDATE ${table} SET option = $1, updated_at=NOW() WHERE code_etudiant = $2`, [value, code]);
 }
 }
 } else if (field === 'academicYear') {
 if (!annee) return res.status(400).json({ success: false });
 for (let p = 1; p <= 3; p++) {
 const table = `resultats_${annee}_${p}`;
 await pool.query(`UPDATE ${table} SET academic_year = $1, updated_at=NOW() WHERE code_etudiant = $2`, [value, code]);
 }
 }
 res.json({ success: true });
 } catch (err) {
 logger.error(err);
 res.status(500).json({ success: false });
 }
});

app.delete('/api/admin/student/:code', async (req, res) => {
 const auth = req.headers.authorization?.match(/^Bearer (.+)$/);
 if (!verifyAdminToken(auth?.[1])) return res.status(401).json({ success: false, message: 'Token invalide.' });
 const { code } = req.params;
 try {
 for (let a = 1; a <= 3; a++) {
 for (let p = 1; p <= 3; p++) {
 const table = `resultats_${a}_${p}`;
 await pool.query(`DELETE FROM ${table} WHERE code_etudiant = $1`, [code]);
 }
 }
 res.json({ success: true });
 } catch (err) {
 logger.error(err);
 res.status(500).json({ success: false });
 }
});

// Servir le front-end
// app.use(express.static(path.join(__dirname, '../dist')));
// app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, '../dist/index.html'));
// });

app.listen(PORT, () => logger.info(`Serveur unifié sur http://localhost:${PORT}`));
