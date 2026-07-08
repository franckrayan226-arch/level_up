const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// ═══════════════════════════════════════════
// MIDDLEWARES
// ═══════════════════════════════════════════
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════
// MULTER — UPLOADS
// ═══════════════════════════════════════════

// Storage général
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Storage couleurs (sous-dossier)
const colorStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'couleurs');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `color-${uuidv4()}${ext}`);
  }
});
const colorUpload = multer({ storage: colorStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// Storage paiements
const paymentStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'payments');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `payment-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const paymentUpload = multer({ storage: paymentStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// ═══════════════════════════════════════════
// DONNÉES JSON
// ═══════════════════════════════════════════
const DATA_PATH = process.env.RENDER
  ? path.join('/tmp', 'boutique.json')
  : path.join(__dirname, 'data', 'boutique.json');

async function loadData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    const defaultData = {
      produits: [],
      categories: ['T-Shirts', 'Hoodies', 'Pantalons', 'Accessoires'],
      parametres: { nomBoutique: 'MONOLITH', devise: 'FCFA', fraisLivraison: 1000 }
    };
    await saveData(defaultData);
    return defaultData;
  }
}

async function saveData(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
const ADMIN_PASSWORD = process.env.MOT_DE_PASSE_ADMIN || 'test1234';

function checkAuth(req, res, next) {
  const auth = req.headers['x-admin-password'] || req.query.key;
  if (auth !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Acces refuse' });
  }
  next();
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function parseCouleurs(body) {
  try {
    if (!body.couleurs) return [];
    const raw = typeof body.couleurs === 'string' ? JSON.parse(body.couleurs) : body.couleurs;
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function parseTailles(body) {
  try {
    if (!body.tailles) return [];
    const raw = typeof body.tailles === 'string' ? JSON.parse(body.tailles) : body.tailles;
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

// ═══════════════════════════════════════════
// API PUBLIQUE
// ═══════════════════════════════════════════

app.get('/api/produits', async (req, res) => {
  const data = await loadData();
  res.json(data.produits.filter(p => p.disponible !== false));
});

app.get('/api/produits/:id', async (req, res) => {
  const data = await loadData();
  const p = data.produits.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit non trouve' });
  res.json(p);
});

app.get('/api/categories', async (req, res) => {
  const data = await loadData();
  res.json(data.categories);
});

// ═══════════════════════════════════════════
// API ADMIN
// ═══════════════════════════════════════════

app.get('/api/admin/stats', checkAuth, async (req, res) => {
  const data = await loadData();
  const produits = data.produits;
  res.json({
    total: produits.length,
    disponibles: produits.filter(p => p.disponible !== false).length,
    enPromo: produits.filter(p => p.promotion > 0).length,
    rupture: produits.filter(p => p.disponible === false).length
  });
});

app.get('/api/admin/produits', checkAuth, async (req, res) => {
  const data = await loadData();
  res.json(data.produits);
});

// POST — Créer un produit (avec image principale + images de couleurs)
app.post('/api/admin/produits', checkAuth, upload.single('image'), async (req, res) => {
  const data = await loadData();
  const couleurs = parseCouleurs(req.body);
  const tailles = parseTailles(req.body);

  const produit = {
    id: uuidv4().slice(0, 8),
    nom: req.body.nom || '',
    prix: parseFloat(req.body.prix) || 0,
    livraison: 1000, // ← FRAIS FIXES
    description: req.body.description || '',
    categorie: req.body.categorie || '',
    promotion: parseFloat(req.body.promotion) || 0,
    stock: parseInt(req.body.stock) || 0,
    disponible: req.body.disponible === 'true' || req.body.disponible === true,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    tailles: tailles,
    couleurs: couleurs,
    dateAjout: new Date().toISOString()
  };

  data.produits.push(produit);
  await saveData(data);
  res.json({ success: true, produit });
});

// PUT — Modifier un produit
app.put('/api/admin/produits/:id', checkAuth, upload.single('image'), async (req, res) => {
  const data = await loadData();
  const idx = data.produits.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Produit non trouve' });

  const couleurs = parseCouleurs(req.body);
  const tailles = parseTailles(req.body);

  const updates = {
    nom: req.body.nom,
    prix: parseFloat(req.body.prix),
    description: req.body.description,
    categorie: req.body.categorie,
    promotion: parseFloat(req.body.promotion) || 0,
    stock: parseInt(req.body.stock) || 0,
    disponible: req.body.disponible === 'true' || req.body.disponible === true,
    tailles: tailles,
    couleurs: couleurs,
    livraison: 1000
  };

  if (req.file) {
    const oldImage = data.produits[idx].image;
    if (oldImage && !oldImage.includes('/couleurs/')) {
      try { await fs.unlink(path.join(__dirname, oldImage.replace('/uploads/', 'uploads/'))); } catch {}
    }
    updates.image = `/uploads/${req.file.filename}`;
  }

  data.produits[idx] = { ...data.produits[idx], ...updates };
  await saveData(data);
  res.json({ success: true, produit: data.produits[idx] });
});

// DELETE — Supprimer un produit
app.delete('/api/admin/produits/:id', checkAuth, async (req, res) => {
  const data = await loadData();
  const idx = data.produits.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Produit non trouve' });

  const produit = data.produits[idx];

  // Supprime image principale
  if (produit.image) {
    try { await fs.unlink(path.join(__dirname, produit.image.replace('/uploads/', 'uploads/'))); } catch {}
  }

  // Supprime images des couleurs
  if (produit.couleurs) {
    for (const c of produit.couleurs) {
      if (c.images) {
        for (const img of c.images) {
          try { await fs.unlink(path.join(__dirname, img.replace('/uploads/', 'uploads/'))); } catch {}
        }
      }
    }
  }

  data.produits.splice(idx, 1);
  await saveData(data);
  res.json({ success: true });
});

// PATCH — Toggle disponible
app.patch('/api/admin/produits/:id/disponible', checkAuth, async (req, res) => {
  const data = await loadData();
  const p = data.produits.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit non trouve' });
  p.disponible = !p.disponible;
  await saveData(data);
  res.json({ success: true, disponible: p.disponible });
});

// POST — Upload images pour une couleur (route séparée)
app.post('/api/admin/upload-color-images', checkAuth, colorUpload.array('images', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucune image' });
  }
  const urls = req.files.map(f => `/uploads/couleurs/${f.filename}`);
  res.json({ success: true, urls });
});

// POST — Upload preuve de paiement
app.post('/api/upload-payment', paymentUpload.single('screenshot'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier' });
  }
  res.json({
    url: `/uploads/payments/${req.file.filename}`,
    filename: req.file.filename
  });
});

// ═══════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════
// FICHIERS STATIQUES
// ═══════════════════════════════════════════
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dashboard admin
app.use('/admin', express.static(path.join(__dirname, 'BACKEND', 'public')));
app.get('/admin', (req, res) => res.redirect('/admin/'));
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'BACKEND', 'public', 'index.html'));
});

// Frontend React (catch-all)
app.use(express.static(path.join(__dirname, 'FRONTEND', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'FRONTEND', 'dist', 'index.html'));
});

// ═══════════════════════════════════════════
// START
// ═══════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`🚀 Serveur sur le port ${PORT}`);
  console.log(`🌐 Site: http://localhost:${PORT}`);
  console.log(`🎛️  Admin: http://localhost:${PORT}/admin/`);
});