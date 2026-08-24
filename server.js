const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { MongoClient, ObjectId } = require('mongodb');
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
    throw new Error("MONGODB_URI est manquant");
  }
  await client.connect();
  // CORRECTION : "monolithe" avec "e" final
  db = client.db('monolithe');
  
  // Vérifier si collection "configuration" existe (au lieu de "config")
  const collections = await db.listCollections().toArray();
  const hasConfig = collections.some(c => c.name === 'config');
  
  if (!hasConfig) {
    // Migrer depuis "configuration" si elle existe
    const oldConfig = await db.collection('configuration').findOne();
    if (oldConfig) {
      await db.collection('config').insertOne({
        _id: 'main',
        categories: oldConfig.categories || ['T-Shirts', 'Hoodies', 'Pantalons', 'Accessoires'],
        parametres: oldConfig.parametres || { nomBoutique: 'MONOLITH', devise: 'FCFA', fraisLivraison: 1000 }
      });
    } else {
      await db.collection('config').insertOne({
        _id: 'main',
        categories: ['T-Shirts', 'Hoodies', 'Pantalons', 'Accessoires'],
        parametres: { nomBoutique: 'MONOLITH', devise: 'FCFA', fraisLivraison: 1000 }
      });
    }
  }
  
  console.log('MongoDB connecte - Base: monolithe');
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

function calculateTotalStock(disponibilite) {
  if (!Array.isArray(disponibilite)) return 0;
  return disponibilite.reduce((sum, d) => sum + (parseInt(d.stock) || 0), 0);
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

// PROTECTION API SI DB INDISPONIBLE
app.use('/api', (req, res, next) => {
  if (!db) {
    return res.status(503).json({ error: 'Base de donnees temporairement indisponible' });
  }
  next();
});

// API PUBLIQUE
app.get('/api/produits', async (req, res) => {
  const produits = await db.collection('produits').find({ disponible: { $ne: false } }).toArray();
  res.json(produits);
});

app.get('/api/produits/search', async (req, res) => {
  const q = req.query.q || '';
  const regex = new RegExp(q, 'i');
  const produits = await db.collection('produits').find({
    disponible: { $ne: false },
    $or: [
      { nom: regex },
      { description: regex },
      { categorie: regex }
    ]
  }).toArray();
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

// Endpoint pour verifier et decrementer le stock
app.post('/api/commande/verifier-stock', async (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Items requis' });
  }

  const results = [];
  const updates = [];

  for (const item of items) {
    const p = await db.collection('produits').findOne({ id: item.productId });
    if (!p) {
      results.push({ ...item, ok: false, raison: 'Produit non trouve' });
      continue;
    }

    const dispo = p.disponibilite?.find(
      d => d.taille === item.taille && d.couleur === item.couleur
    );

    if (!dispo) {
      results.push({ ...item, ok: false, raison: 'Combinaison non configuree' });
      continue;
    }

    if (dispo.stock <= 0) {
      results.push({ ...item, ok: false, raison: 'Rupture de stock', stockRestant: 0 });
      continue;
    }

    if (dispo.stock < item.quantity) {
      results.push({ ...item, ok: false, raison: 'Stock insuffisant', stockRestant: dispo.stock });
      continue;
    }

    results.push({ ...item, ok: true, stockRestant: dispo.stock - item.quantity });
    updates.push({ productId: item.productId, taille: item.taille, couleur: item.couleur, quantity: item.quantity });
  }

  const allOk = results.every(r => r.ok);

  if (allOk) {
    for (const upd of updates) {
      await db.collection('produits').updateOne(
        { id: upd.productId, 'disponibilite.taille': upd.taille, 'disponibilite.couleur': upd.couleur },
        { $inc: { 'disponibilite.$.stock': -upd.quantity } }
      );
    }
    
    const updatedProductIds = [...new Set(updates.map(u => u.productId))];
    for (const pid of updatedProductIds) {
      const p = await db.collection('produits').findOne({ id: pid });
      const newTotal = calculateTotalStock(p.disponibilite);
      await db.collection('produits').updateOne(
        { id: pid },
        { $set: { stock: newTotal, disponible: newTotal > 0 } }
      );
    }
  }

  res.json({ success: allOk, items: results });
});

// API ADMIN
app.get('/api/admin/stats', checkAuth, async (req, res) => {
  const total = await db.collection('produits').countDocuments();
  const dispo = await db.collection('produits').countDocuments({ disponible: { $ne: false } });
  const promo = await db.collection('produits').countDocuments({ promotion: { $gt: 0 } });
  const rupture = await db.collection('produits').countDocuments({ disponible: false });
  res.json({ total, disponibles: dispo, enPromo: promo, rupture });
});

// ============================================
// ANALYTICS VISITEURS (additif — n'affecte aucune route existante)
// ============================================
function dateDuJour() {
  return new Date().toISOString().slice(0, 10);
}

// Enregistre une vue de page (appelé par le site à chaque changement de page)
app.post('/api/analytics/visite', async (req, res) => {
  const { page, produitId, sid } = req.body || {};
  if (!sid) return res.status(400).json({ error: 'sid requis' });
  const r = await db.collection('visites').insertOne({
    sid: String(sid).slice(0, 64),
    page: String(page || 'autre').slice(0, 32),
    produitId: produitId ? String(produitId).slice(0, 64) : null,
    duree: 0,
    ts: new Date(),
    date: dateDuJour(),
  });
  res.json({ id: r.insertedId });
});

// Durée de la visite (envoyée au moment où l'onglet est quitté/masqué)
app.post('/api/analytics/duree', async (req, res) => {
  const { id, duree } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id requis' });
  try {
    await db.collection('visites').updateOne(
      { _id: new ObjectId(String(id)) },
      { $set: { duree: Math.max(0, Math.min(parseInt(duree) || 0, 7200)) } }
    );
  } catch {}
  res.json({ success: true });
});

// Statistiques agrégées pour le dashboard (protégé par mot de passe admin)
app.get('/api/analytics/stats', checkAuth, async (req, res) => {
  const jours = Math.min(Math.max(parseInt(req.query.jours) || 14, 1), 90);
  const depuis = new Date(Date.now() - (jours - 1) * 86400000);
  depuis.setHours(0, 0, 0, 0);
  const col = db.collection('visites');

  const [totalVisites, sidsUniques, visitesAujourdHui, dureeGlobale, parPage, topProduits, serie] = await Promise.all([
    col.countDocuments({}),
    col.distinct('sid').then(a => a.length),
    col.countDocuments({ date: dateDuJour() }),
    col.aggregate([{ $group: { _id: null, moyenne: { $avg: '$duree' } } }]).toArray(),
    col.aggregate([
      { $group: { _id: '$page', visites: { $sum: 1 }, uniques: { $addToSet: '$sid' } } },
      { $project: { _id: 0, page: '$_id', visites: 1, uniques: { $size: '$uniques' } } },
      { $sort: { visites: -1 } },
    ]).toArray(),
    col.aggregate([
      { $match: { produitId: { $ne: null } } },
      { $group: {
          _id: '$produitId',
          visites: { $sum: 1 },
          uniques: { $addToSet: '$sid' },
          dureeMoyenne: { $avg: '$duree' },
      }},
      { $project: { _id: 0, produitId: '$_id', visites: 1, uniques: { $size: '$uniques' }, dureeMoyenne: { $round: ['$dureeMoyenne', 0] } } },
      { $sort: { visites: -1 } },
      { $limit: 10 },
    ]).toArray(),
    col.aggregate([
      { $match: { ts: { $gte: depuis } } },
      { $group: { _id: '$date', visites: { $sum: 1 }, uniques: { $addToSet: '$sid' } } },
      { $project: { _id: 0, date: '$_id', visites: 1, uniques: { $size: '$uniques' } } },
      { $sort: { date: 1 } },
    ]).toArray(),
  ]);

  // Remplir les jours sans visite (serie continue pour la courbe)
  const serieMap = Object.fromEntries(serie.map(s => [s.date, s]));
  const serieComplete = [];
  for (let i = 0; i < jours; i++) {
    const key = new Date(depuis.getTime() + i * 86400000).toISOString().slice(0, 10);
    serieComplete.push({
      date: key,
      visites: serieMap[key]?.visites || 0,
      uniques: serieMap[key]?.uniques || 0,
    });
  }

  // Rattacher les noms aux produits les plus vus
  const produitIds = topProduits.map(t => t.produitId);
  const produitsConnus = produitIds.length
    ? await db.collection('produits').find({ id: { $in: produitIds } }).project({ id: 1, nom: 1 }).toArray()
    : [];
  const nomMap = Object.fromEntries(produitsConnus.map(p => [p.id, p.nom]));

  res.json({
    totaux: {
      visites: totalVisites,
      visiteursUniques: sidsUniques,
      visitesAujourdHui,
      dureeMoyenne: Math.round(dureeGlobale[0]?.moyenne || 0),
    },
    parPage,
    topProduits: topProduits.map(t => ({ ...t, nom: nomMap[t.produitId] || 'Produit supprime' })),
    serie: serieComplete,
  });
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

  const disponibilite = parseDisponibilite(req.body);
  const totalStock = calculateTotalStock(disponibilite);

  const produit = {
    id: uuidv4().slice(0, 8),
    nom: req.body.nom || '',
    prix: parseFloat(req.body.prix) || 0,
    livraison: 1000,
    description: req.body.description || '',
    categorie: req.body.categorie || '',
    promotion: parseFloat(req.body.promotion) || 0,
    stock: totalStock,
    disponible: req.body.disponible === 'true' || req.body.disponible === true,
    disponibilite: disponibilite,
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

  const disponibilite = parseDisponibilite(req.body);
  const totalStock = calculateTotalStock(disponibilite);

  const updates = {
    nom: req.body.nom,
    prix: parseFloat(req.body.prix),
    description: req.body.description,
    categorie: req.body.categorie,
    promotion: parseFloat(req.body.promotion) || 0,
    stock: totalStock,
    disponible: req.body.disponible === 'true' || req.body.disponible === true,
    disponibilite: disponibilite,
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
  res.json({ status: 'ok', timestamp: new Date().toISOString(), dbConnected: !!db });
});

// BACKUP / RESTORE
app.get('/api/admin/backup', checkAuth, async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB indisponible' });
  const produits = await db.collection('produits').find().toArray();
  const config = await db.collection('config').findOne({ _id: 'main' });
  res.setHeader('Content-Disposition', 'attachment; filename=backup-monolith.json');
  res.json({ produits, config, exportedAt: new Date().toISOString() });
});

app.post('/api/admin/restore', checkAuth, async (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB indisponible' });
  const { produits, config } = req.body;
  if (produits?.length) {
    await db.collection('produits').deleteMany({});
    await db.collection('produits').insertMany(produits);
  }
  if (config) {
    await db.collection('config').replaceOne({ _id: 'main' }, config, { upsert: true });
  }
  res.json({ success: true, count: produits?.length || 0 });
});

// DASHBOARD ADMIN
app.use('/admin', express.static(path.join(__dirname, 'BACKEND', 'public')));
app.get('/admin', (req, res) => res.redirect('/admin/'));
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'BACKEND', 'public', 'index.html'));
});

// FRONTEND REACT (CATCH-ALL TOUJOURS EN DERNIER)
// Assets hashes (contenu immutable) -> cache 1 an.
// index.html -> JAMAIS cache par le navigateur (evite les pages blanches
// apres un deploiement : ancien index.html demandant un ancien bundle supprime).
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), {
  immutable: true,
  maxAge: '1y',
}));

app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route API non trouvee' });
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// START
async function start() {
  try {
    await initDB();
  } catch (err) {
    console.error('MongoDB non connecte (le serveur continue en mode degrade):', err.message);
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur sur le port ${PORT}`);
    console.log(`Site: http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin/`);
  });
}

start();