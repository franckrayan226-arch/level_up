const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// ─── CORS ───
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MULTER ───
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

// ─── DONNÉES JSON ───
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
      parametres: { nomBoutique: 'MONOLITH', devise: 'FCFA' }
    };
    await saveData(defaultData);
    return defaultData;
  }
}

async function saveData(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// ─── AUTH ───
const ADMIN_PASSWORD = process.env.MOT_DE_PASSE_ADMIN || 'test1234';

function checkAuth(req, res, next) {
  const auth = req.headers['x-admin-password'] || req.query.key;
  if (auth !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Acces refuse' });
  }
  next();
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

app.post('/api/admin/produits', checkAuth, upload.single('image'), async (req, res) => {
  const data = await loadData();
  const produit = {
    id: uuidv4().slice(0, 8),
    nom: req.body.nom || '',
    prix: parseFloat(req.body.prix) || 0,
    description: req.body.description || '',
    categorie: req.body.categorie || '',
    promotion: parseFloat(req.body.promotion) || 0,
    stock: parseInt(req.body.stock) || 0,
    disponible: req.body.disponible === 'true' || req.body.disponible === true,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    dateAjout: new Date().toISOString()
  };
  data.produits.push(produit);
  await saveData(data);
  res.json({ success: true, produit });
});

app.put('/api/admin/produits/:id', checkAuth, upload.single('image'), async (req, res) => {
  const data = await loadData();
  const idx = data.produits.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Produit non trouve' });
  
  const updates = {
    nom: req.body.nom,
    prix: parseFloat(req.body.prix),
    description: req.body.description,
    categorie: req.body.categorie,
    promotion: parseFloat(req.body.promotion) || 0,
    stock: parseInt(req.body.stock) || 0,
    disponible: req.body.disponible === 'true' || req.body.disponible === true
  };
  
  if (req.file) {
    const oldImage = data.produits[idx].image;
    if (oldImage) {
      try { await fs.unlink(path.join(__dirname, oldImage.replace('/uploads/', 'uploads/'))); } catch {}
    }
    updates.image = `/uploads/${req.file.filename}`;
  }
  
  data.produits[idx] = { ...data.produits[idx], ...updates };
  await saveData(data);
  res.json({ success: true, produit: data.produits[idx] });
});

app.delete('/api/admin/produits/:id', checkAuth, async (req, res) => {
  const data = await loadData();
  const idx = data.produits.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Produit non trouve' });
  
  const image = data.produits[idx].image;
  if (image) {
    try { await fs.unlink(path.join(__dirname, image.replace('/uploads/', 'uploads/'))); } catch {}
  }
  
  data.produits.splice(idx, 1);
  await saveData(data);
  res.json({ success: true });
});

app.patch('/api/admin/produits/:id/disponible', checkAuth, async (req, res) => {
  const data = await loadData();
  const p = data.produits.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit non trouve' });
  p.disponible = !p.disponible;
  await saveData(data);
  res.json({ success: true, disponible: p.disponible });
});

// ═══════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════
// UPLOADS STATIQUES (AVANT les autres routes)
// ═══════════════════════════════════════════

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════
// DASHBOARD ADMIN
// ═══════════════════════════════════════════

app.use('/admin', express.static(path.join(__dirname, 'BACKEND', 'public')));

app.get('/admin', (req, res) => {
  res.redirect('/admin/');
});

app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'BACKEND', 'public', 'index.html'));
});

// ═══════════════════════════════════════════
// FRONTEND REACT (TOUJOURS EN DERNIER)
// ═══════════════════════════════════════════

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