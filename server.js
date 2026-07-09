

const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 8080;

// CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MONGODB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri || 'mongodb://localhost:27017');
let db;

async function initDB() {
  if (!uri) {
    console.error("ERREUR: MONGODB_URI est manquant");
    process.exit(1);
  }
  await client.connect();
  db = client.db('monolith');
  const config = await db.collection('config').findOne({ _id: 'main' });
  if (!config) {
    await db.collection('config').insertOne({
      _id: 'main',
      categories: ['T-Shirts', 'Hoodies', 'Pantalons', 'Accessoires'],
      parametres: { nomBoutique: 'MONOLITH', devise: 'FCFA', fraisLivraison: 1000 }
    });
  }
  console.log('MongoDB connecte');
}

// MIDDLEWARES
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MULTER
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const colorUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const paymentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// HELPERS
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

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

function parseDisponibilite(body) {
  try {
    if (!body.disponibilite) return [];
    const raw = typeof body.disponibilite === 'string' ? JSON.parse(body.disponibilite) : body.disponibilite;
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

// AUTH
const ADMIN_PASSWORD = process.env.MOT_DE_PASSE_ADMIN || 'test1234';

function checkAuth(req, res, next) {
  const auth = req.headers['x-admin-password'] || req.query.key;
  if (auth !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Acces refuse' });
  }
  next();
}

// FICHIERS STATIQUES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API PUBLIQUE
app.get('/api/produits', async (req, res) => {
  const produits = await db.collection('produits').find({ disponible: { $ne: false } }).toArray();
  res.json(produits);
});

app.get('/api/produits/:id', async (req, res) => {
  const p = await db.collection('produits').findOne({ id: req.params.id });
  if (!p) return res.status(404).json({ error: 'Produit non trouve' });
  res.json(p);
});

app.get('/api/categories', async (req, res) => {
  const config = await db.collection('config').findOne({ _id: 'main' });
  res.json(config?.categories || []);
});

// API ADMIN
app.get('/api/admin/stats', checkAuth, async (req, res) => {
  const total = await db.collection('produits').countDocuments();
  const dispo = await db.collection('produits').countDocuments({ disponible: { $ne: false } });
  const promo = await db.collection('produits').countDocuments({ promotion: { $gt: 0 } });
  const rupture = await db.collection('produits').countDocuments({ disponible: false });
  res.json({ total, disponibles: dispo, enPromo: promo, rupture });
});

app.get('/api/admin/produits', checkAuth, async (req, res) => {
  const produits = await db.collection('produits').find().toArray();
  res.json(produits);
});

app.post('/api/admin/produits', checkAuth, upload.single('image'), async (req, res) => {
  let imageUrl = null;
  if (req.file) {
    imageUrl = await uploadToCloudinary(req.file.buffer, 'monolith/produits');
  }

  const produit = {
    id: uuidv4().slice(0, 8),
    nom: req.body.nom || '',
    prix: parseFloat(req.body.prix) || 0,
    livraison: 1000,
    description: req.body.description || '',
    categorie: req.body.categorie || '',
    promotion: parseFloat(req.body.promotion) || 0,
    stock: parseInt(req.body.stock) || 0,
    disponible: req.body.disponible === 'true' || req.body.disponible === true,
    disponibilite: parseDisponibilite(req.body),
    image: imageUrl,
    tailles: parseTailles(req.body),
    couleurs: parseCouleurs(req.body),
    dateAjout: new Date().toISOString()
  };

  await db.collection('produits').insertOne(produit);
  res.json({ success: true, produit });
});

app.put('/api/admin/produits/:id', checkAuth, upload.single('image'), async (req, res) => {
  const existing = await db.collection('produits').findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Produit non trouve' });

  let imageUrl = existing.image;
  if (req.file) {
    imageUrl = await uploadToCloudinary(req.file.buffer, 'monolith/produits');
  }

  const updates = {
    nom: req.body.nom,
    prix: parseFloat(req.body.prix),
    description: req.body.description,
    categorie: req.body.categorie,
    promotion: parseFloat(req.body.promotion) || 0,
    stock: parseInt(req.body.stock) || 0,
    disponible: req.body.disponible === 'true' || req.body.disponible === true,
    disponibilite: parseDisponibilite(req.body),
    tailles: parseTailles(req.body),
    couleurs: parseCouleurs(req.body),
    livraison: 1000,
    image: imageUrl
  };

  await db.collection('produits').updateOne({ id: req.params.id }, { $set: updates });
  const updated = await db.collection('produits').findOne({ id: req.params.id });
  res.json({ success: true, produit: updated });
});

app.delete('/api/admin/produits/:id', checkAuth, async (req, res) => {
  await db.collection('produits').deleteOne({ id: req.params.id });
  res.json({ success: true });
});

app.patch('/api/admin/produits/:id/disponible', checkAuth, async (req, res) => {
  const p = await db.collection('produits').findOne({ id: req.params.id });
  if (!p) return res.status(404).json({ error: 'Produit non trouve' });
  const newDispo = !p.disponible;
  await db.collection('produits').updateOne({ id: req.params.id }, { $set: { disponible: newDispo } });
  res.json({ success: true, disponible: newDispo });
});

app.post('/api/admin/upload-color-images', checkAuth, colorUpload.array('images', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucune image' });
  }
  const urls = [];
  for (const file of req.files) {
    const url = await uploadToCloudinary(file.buffer, 'monolith/couleurs');
    urls.push(url);
  }
  res.json({ success: true, urls });
});

app.post('/api/upload-payment', paymentUpload.single('screenshot'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier' });
  }
  const url = await uploadToCloudinary(req.file.buffer, 'monolith/payments');
  res.json({ url: url, filename: req.file.originalname });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// DASHBOARD ADMIN
app.use('/admin', express.static(path.join(__dirname, 'BACKEND', 'public')));
app.get('/admin', (req, res) => res.redirect('/admin/'));
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'BACKEND', 'public', 'index.html'));
});

// FRONTEND REACT (CATCH-ALL TOUJOURS EN DERNIER)
app.use(express.static(path.join(__dirname, 'FRONTEND', 'dist')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route API non trouvee' });
  }
  res.sendFile(path.join(__dirname, 'FRONTEND', 'dist', 'index.html'));
});

// START
async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Serveur sur le port ${PORT}`);
    console.log(`Site: http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin/`);
  });
}

start();

