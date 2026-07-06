const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const DATA_PATH = process.env.RENDER ? path.join('/tmp', 'boutique.json') : path.join(__dirname, 'data', 'boutique.json');

async function loadData() {
  try {
    return JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
  } catch {
    const d = { produits: [], categories: ['T-Shirts','Hoodies','Pantalons','Accessoires'], parametres: { nomBoutique: 'MONOLITH', devise: 'FCFA' }};
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(d, null, 2));
    return d;
  }
}
async function saveData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

const ADMIN_PASSWORD = process.env.MOT_DE_PASSE_ADMIN || 'test1234';
function checkAuth(req, res, next) {
  const auth = req.headers['x-admin-password'] || req.query.key;
  if (auth !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Acces refuse' });
  next();
}

// API
app.get('/api/produits', async (req, res) => { const d = await loadData(); res.json(d.produits.filter(p => p.disponible !== false)); });
app.get('/api/produits/:id', async (req