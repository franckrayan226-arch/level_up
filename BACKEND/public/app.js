const API_BASE = '';

let currentProduits = [];
let deleteTargetId = null;
let authPassword = localStorage.getItem('monolith_auth') || '';
let colorBlocks = [];
let selectedSizes = new Set();
let disponibiliteData = [];
let editingProductId = null;

// ============================================
// AUTH
// ============================================

function doLogin() {
  const input = document.getElementById('password-input');
  const error = document.getElementById('login-error');
  const password = input.value.trim();

  if (!password) {
    error.textContent = 'Entrez un mot de passe';
    return;
  }

  fetch(`${API_BASE}/api/admin/stats`, {
    headers: { 'X-Admin-Password': password }
  })
  .then(res => {
    if (res.ok) {
      authPassword = password;
      localStorage.setItem('monolith_auth', password);
      showDashboard();
    } else {
      error.textContent = 'Mot de passe incorrect';
      input.value = '';
      input.focus();
    }
  })
  .catch(() => {
    error.textContent = 'Erreur de connexion';
  });
}

function logout() {
  authPassword = '';
  localStorage.removeItem('monolith_auth');
  location.reload();
}

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  initDashboard();
}

// ============================================
// NAVIGATION
// ============================================

function showSection(section) {
  document.querySelectorAll('.dash-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  document.getElementById(`section-${section}`).classList.remove('hidden');

  const link = document.querySelector(`.nav-link[data-section="${section}"]`);
  if (link) link.classList.add('active');

  if (section === 'overview') loadStats();
  if (section === 'produits') loadProduits();
  if (section === 'ajouter') {
    if (!editingProductId) {
      resetForm();
    }
  }
}

// ============================================
// API
// ============================================

async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Admin-Password': authPassword,
      ...options.headers
    }
  });

  if (res.status === 403) {
    logout();
    throw new Error('Session expiree');
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erreur serveur');
  }

  return res.json();
}

async function initDashboard() {
  await loadCategories();
  await loadStats();
  showSection('overview');
}

async function loadCategories() {
  try {
    const cats = await api('/api/categories');
    const selects = [
      document.getElementById('form-categorie'),
      document.getElementById('filter-categorie')
    ];

    selects.forEach(select => {
      if (!select) return;
      const options = cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
      if (select.id === 'form-categorie') {
        select.innerHTML = '<option value="">Selectionner...</option>' + options;
      } else {
        select.innerHTML = '<option value="">Toutes categories</option>' + options;
      }
    });
  } catch (e) {
    console.error('Erreur categories:', e);
  }
}

async function loadStats() {
  try {
    const stats = await api('/api/admin/stats');
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-dispo').textContent = stats.disponibles;
    document.getElementById('stat-promo').textContent = stats.enPromo;
    document.getElementById('stat-rupture').textContent = stats.rupture;

    const produits = await api('/api/admin/produits');
    currentProduits = produits;
    renderRecents(produits.slice(-4).reverse());
  } catch (e) {
    console.error('Erreur stats:', e);
    toast('Erreur chargement stats: ' + e.message, 'error');
  }
}

function renderRecents(produits) {
  const grid = document.getElementById('recent-grid');
  if (!produits.length) {
    grid.innerHTML = '<div class="recent-item"><div class="recent-item-name" style="color:var(--text-muted)">Aucun produit</div></div>';
    return;
  }

  grid.innerHTML = produits.map(p => {
    const prixFinal = p.promotion > 0 ? Math.round(p.prix * (1 - p.promotion/100)) : p.prix;
    const prixAvecLivraison = prixFinal + (p.livraison || 1000);
    const imageUrl = p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`) : '';
    const taillesStr = p.tailles && p.tailles.length ? p.tailles.join(' / ') : '';
    const couleursStr = p.couleurs && p.couleurs.length ? p.couleurs.map(c => c.nom).join(' / ') : '';
    const totalStock = p.stock || 0;

    return `
      <div class="recent-item">
        <img src="${imageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}" 
             class="recent-item-img" alt="${escapeHtml(p.nom)}" 
             onerror="this.style.display='none'">
        <div class="recent-item-name">${escapeHtml(p.nom)}</div>
        <div class="recent-item-price ${p.promotion > 0 ? 'recent-item-promo' : ''}">
          ${prixFinal} FCFA
          ${p.promotion > 0 ? `<span style="text-decoration:line-through;opacity:0.5;margin-left:8px">${p.prix}</span>` : ''}
        </div>
        <div class="prix-final">Total: ${prixAvecLivraison} FCFA (livraison incluse)</div>
        ${taillesStr ? `<div style="font-size:10px;color:var(--text-dim);margin-top:4px;letter-spacing:1px">${escapeHtml(taillesStr)}</div>` : ''}
        ${couleursStr ? `<div style="font-size:10px;color:var(--text-dim);margin-top:2px;letter-spacing:1px">${escapeHtml(couleursStr)}</div>` : ''}
        <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Stock total: ${totalStock}</div>
        <div class="recent-item-status ${p.disponible !== false ? 'status-dispo' : 'status-rupture'}">
          ${p.disponible !== false ? 'EN LIGNE' : 'RUPTURE'}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// PRODUITS LIST
// ============================================

async function loadProduits() {
  try {
    const produits = await api('/api/admin/produits');
    currentProduits = produits;
    renderProduits(produits);
  } catch (e) {
    toast('Erreur chargement produits: ' + e.message, 'error');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderProduits(produits) {
  const tbody = document.getElementById('produits-tbody');

  if (!produits.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:60px;color:var(--text-muted)">
          Aucun produit trouve
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = produits.map(p => {
    const prixFinal = p.promotion > 0 ? Math.round(p.prix * (1 - p.promotion/100)) : p.prix;
    const prixAvecLivraison = prixFinal + (p.livraison || 1000);
    const imageUrl = p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`) : '';
    const taillesStr = p.tailles && p.tailles.length ? p.tailles.join(' / ') : '';
    const couleursStr = p.couleurs && p.couleurs.length ? p.couleurs.map(c => c.nom).join(' / ') : '';
    const totalStock = p.stock || 0;

    return `
      <tr>
        <td>
          <img src="${imageUrl}" class="table-img" alt="" onerror="this.style.display='none'">
        </td>
        <td>
          <div class="table-name">${escapeHtml(p.nom)}</div>
          ${p.description ? `<div style="font-size:11px;color:var(--text-dim);margin-top:4px">${escapeHtml(p.description.substring(0, 50))}...</div>` : ''}
          ${taillesStr ? `<div style="font-size:10px;color:var(--text-dim);margin-top:4px;letter-spacing:0.5px">Tailles: ${escapeHtml(taillesStr)}</div>` : ''}
          ${couleursStr ? `<div style="font-size:10px;color:var(--text-dim);margin-top:2px;letter-spacing:0.5px">Couleurs: ${escapeHtml(couleursStr)}</div>` : ''}
          <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Stock total: ${totalStock}</div>
        </td>
        <td><span class="table-cat">${escapeHtml(p.categorie) || '—'}</span></td>
        <td>
          <span class="table-price ${p.promotion > 0 ? 'table-price-promo' : ''}">
            ${prixFinal} FCFA
          </span>
          ${p.promotion > 0 ? `<span class="table-price-original">${p.prix}</span>` : ''}
          <div class="prix-final">+ livraison: ${prixAvecLivraison} FCFA</div>
        </td>
        <td>
          <button class="table-status" onclick="toggleDisponible('${p.id}', ${p.disponible !== false})">
            <span class="status-dot ${p.disponible !== false ? 'dispo' : 'rupture'}"></span>
            ${p.disponible !== false ? 'DISPONIBLE' : 'RUPTURE'}
          </button>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick='editProduitHandler("${p.id}")' title="Modifier">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon delete" onclick="askDelete('${p.id}')" title="Supprimer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterProduits() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const cat = document.getElementById('filter-categorie').value;
  const statut = document.getElementById('filter-statut').value;

  let filtered = currentProduits;

  if (search) {
    filtered = filtered.filter(p => 
      (p.nom && p.nom.toLowerCase().includes(search)) ||
      (p.categorie && p.categorie.toLowerCase().includes(search)) ||
      (p.couleurs && p.couleurs.some(c => c.nom && c.nom.toLowerCase().includes(search)))
    );
  }

  if (cat) filtered = filtered.filter(p => p.categorie === cat);
  if (statut === 'dispo') filtered = filtered.filter(p => p.disponible !== false);
  if (statut === 'rupture') filtered = filtered.filter(p => p.disponible === false);
  if (statut === 'promo') filtered = filtered.filter(p => p.promotion > 0);

  renderProduits(filtered);
}

async function toggleDisponible(id, current) {
  try {
    await api(`/api/admin/produits/${id}/disponible`, { method: 'PATCH' });
    toast(current ? 'Produit mis hors ligne' : 'Produit mis en ligne', 'success');
    loadProduits();
    loadStats();
  } catch (e) {
    toast('Erreur: ' + e.message, 'error');
  }
}

// ============================================
// EDIT PRODUIT
// ============================================

async function editProduitHandler(id) {
  const p = currentProduits.find(prod => prod.id === id);
  if (!p) {
    toast('Produit non trouve', 'error');
    return;
  }
  editProduit(p);
}

// ============================================
// DISPONIBILITE MATRIX AVEC STOCK
// ============================================

function renderDisponibiliteMatrix() {
  const container = document.getElementById('disponibilite-matrix-container');
  if (!container) return;
  
  const tailles = [...selectedSizes];
  const couleurs = colorBlocks.map(b => {
    const input = document.querySelector(`#${b.id} .color-name-input`);
    return input ? input.value.trim() : '';
  }).filter(n => n);
  
  if (tailles.length === 0 || couleurs.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:12px;">Ajoutez des tailles et des couleurs pour gerer le stock.</p>';
    return;
  }
  
  let html = '<div class="dispo-matrix"><div class="dispo-matrix-header"><div class="dispo-cell empty"></div>';
  couleurs.forEach(c => {
    html += `<div class="dispo-cell header">${escapeHtml(c)}</div>`;
  });
  html += '</div>';
  
  tailles.forEach(t => {
    html += `<div class="dispo-matrix-row"><div class="dispo-cell row-header">${escapeHtml(t)}</div>`;
    couleurs.forEach(c => {
      const existing = disponibiliteData.find(d => d.taille === t && d.couleur === c);
      const stock = existing ? (existing.stock ?? 0) : 0;
      const isAvailable = existing ? (existing.disponible !== false && stock > 0) : true;
      html += `
        <div class="dispo-cell" style="flex-direction:column;gap:6px;min-width:90px;">
          <div style="display:flex;align-items:center;gap:4px;">
            <input type="number" 
              data-taille="${escapeHtml(t)}" 
              data-couleur="${escapeHtml(c)}"
              value="${stock}" 
              min="0"
              placeholder="0"
              style="width:50px;text-align:center;background:var(--bg-input);border:1px solid var(--border);color:var(--text);padding:6px;font-size:12px;font-family:var(--font-mono);"
              onchange="updateDisponibiliteStock('${escapeHtml(t)}', '${escapeHtml(c)}', this.value)"
            >
            <span style="font-size:10px;color:var(--text-muted);">qty</span>
          </div>
          <label class="dispo-checkbox" style="transform:scale(0.85);">
            <input type="checkbox" 
              data-taille="${escapeHtml(t)}" 
              data-couleur="${escapeHtml(c)}"
              ${isAvailable ? 'checked' : ''}
              onchange="toggleDisponibiliteCell('${escapeHtml(t)}', '${escapeHtml(c)}', this.checked)"
            >
            <span class="dispo-check"></span>
          </label>
        </div>
      `;
    });
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function updateDisponibiliteStock(taille, couleur, stockValue) {
  const stock = parseInt(stockValue) || 0;
  const idx = disponibiliteData.findIndex(d => d.taille === taille && d.couleur === couleur);
  if (idx >= 0) {
    disponibiliteData[idx].stock = stock;
    if (stock <= 0) disponibiliteData[idx].disponible = false;
  } else {
    disponibiliteData.push({ taille, couleur, disponible: stock > 0, stock });
  }
}

function toggleDisponibiliteCell(taille, couleur, checked) {
  const idx = disponibiliteData.findIndex(d => d.taille === taille && d.couleur === couleur);
  if (idx >= 0) {
    disponibiliteData[idx].disponible = checked;
  } else {
    disponibiliteData.push({ taille, couleur, disponible: checked, stock: 0 });
  }
}

function getDisponibiliteData() {
  const inputs = document.querySelectorAll('#disponibilite-matrix-container input[type="number"]');
  const checkboxes = document.querySelectorAll('#disponibilite-matrix-container input[type="checkbox"]');
  
  const tailles = [...selectedSizes];
  const couleurs = colorBlocks.map(b => {
    const input = document.querySelector(`#${b.id} .color-name-input`);
    return input ? input.value.trim() : '';
  }).filter(n => n);
  
  const result = [];
  
  tailles.forEach(t => {
    couleurs.forEach(c => {
      const stockInput = Array.from(inputs).find(i => i.dataset.taille === t && i.dataset.couleur === c);
      const cb = Array.from(checkboxes).find(i => i.dataset.taille === t && i.dataset.couleur === c);
      const stock = stockInput ? parseInt(stockInput.value) || 0 : 0;
      const disponible = cb ? cb.checked : stock > 0;
      
      result.push({
        taille: t,
        couleur: c,
        disponible: disponible && stock > 0,
        stock: stock
      });
    });
  });
  
  return result;
}

function setDisponibiliteData(data) {
  disponibiliteData = Array.isArray(data) ? data.map(d => ({ ...d, stock: d.stock ?? 0 })) : [];
}

// ============================================
// TAILLES
// ============================================

function toggleSize(btn) {
  const size = btn.dataset.size;
  if (selectedSizes.has(size)) {
    selectedSizes.delete(size);
    btn.classList.remove('active');
  } else {
    selectedSizes.add(size);
    btn.classList.add('active');
  }
  updateSizesInput();
  renderDisponibiliteMatrix();
}

function addCustomSize() {
  const input = document.getElementById('custom-size-input');
  const val = input.value.trim().toUpperCase();
  if (!val) return;

  const container = document.getElementById('sizes-container');
  if (selectedSizes.has(val)) { input.value = ''; return; }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'size-chip active';
  btn.dataset.size = val;
  btn.textContent = val;
  btn.onclick = () => toggleSize(btn);
  container.appendChild(btn);

  selectedSizes.add(val);
  updateSizesInput();
  input.value = '';
  renderDisponibiliteMatrix();
}

function updateSizesInput() {
  document.getElementById('form-tailles').value = JSON.stringify([...selectedSizes]);
}

function setSizes(tailles) {
  selectedSizes.clear();
  document.querySelectorAll('.size-chip').forEach(btn => {
    btn.classList.remove('active');
    if (tailles.includes(btn.dataset.size)) {
      btn.classList.add('active');
      selectedSizes.add(btn.dataset.size);
    }
  });
  document.querySelectorAll('.size-chip').forEach(btn => {
    if (!['S','M','L','XL','XXL','TU'].includes(btn.dataset.size)) {
      if (!tailles.includes(btn.dataset.size)) {
        btn.remove();
      }
    }
  });
  tailles.forEach(t => {
    if (!['S','M','L','XL','XXL','TU'].includes(t) && !selectedSizes.has(t)) {
      const container = document.getElementById('sizes-container');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-chip active';
      btn.dataset.size = t;
      btn.textContent = t;
      btn.onclick = () => toggleSize(btn);
      container.appendChild(btn);
      selectedSizes.add(t);
    }
  });
  updateSizesInput();
  renderDisponibiliteMatrix();
}

// ============================================
// COULEURS
// ============================================

function addColorBlock(existing = null) {
  const container = document.getElementById('colors-container');
  const blockId = 'color-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);

  const block = document.createElement('div');
  block.className = 'color-block';
  block.id = blockId;
  block.dataset.blockId = blockId;

  const colorName = existing ? existing.nom : '';
  const existingImages = existing && existing.images ? existing.images : [];

  block.innerHTML = `
    <div class="color-block-header">
      <input type="text" class="color-name-input" placeholder="Nom de la couleur (ex: Noir, Blanc...)" value="${escapeHtml(colorName)}">
      <button type="button" class="color-remove-btn" onclick="removeColorBlock('${blockId}')">SUPPRIMER</button>
    </div>
    <div class="color-images-zone" onclick="document.getElementById('color-file-${blockId}').click()">
      <input type="file" id="color-file-${blockId}" multiple accept="image/*" style="display:none" onchange="handleColorImages(this, '${blockId}')">
      <div class="upload-icon">+</div>
      <div class="upload-text">PHOTOS DE CETTE COULEUR</div>
      <div class="upload-hint">JPG, PNG, WEBP — MAX 5MB</div>
    </div>
    <div class="color-images-preview" id="color-preview-${blockId}"></div>
  `;

  container.appendChild(block);

  const blockData = { id: blockId, name: colorName, files: [], previews: [] };
  colorBlocks.push(blockData);

  if (existingImages.length) {
    existingImages.forEach((imgUrl) => {
      const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`;
      blockData.previews.push({ url: fullUrl, isExisting: true, serverUrl: imgUrl });
    });
    renderColorPreview(blockId);
  }

  const nameInput = block.querySelector('.color-name-input');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      renderDisponibiliteMatrix();
    });
  }
  
  renderDisponibiliteMatrix();
}

function removeColorBlock(blockId) {
  const el = document.getElementById(blockId);
  if (el) el.remove();
  colorBlocks = colorBlocks.filter(b => b.id !== blockId);
  renderDisponibiliteMatrix();
}

function handleColorImages(input, blockId) {
  if (!input.files || !input.files.length) return;
  const block = colorBlocks.find(b => b.id === blockId);
  if (!block) return;

  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      block.files.push(file);
      block.previews.push({ url: e.target.result, isExisting: false, file: file });
      renderColorPreview(blockId);
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function renderColorPreview(blockId) {
  const block = colorBlocks.find(b => b.id === blockId);
  const container = document.getElementById(`color-preview-${blockId}`);
  if (!block || !container) return;

  container.innerHTML = block.previews.map((prev, idx) => `
    <div style="position:relative;display:inline-block;">
      <img src="${prev.url}" class="color-img-thumb" alt="">
      <button type="button" class="thumb-remove" onclick="removeColorImage('${blockId}', ${idx})" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;background:var(--danger);color:#fff;border:none;font-size:10px;cursor:pointer;border-radius:50%;">×</button>
    </div>
  `).join('');
}

function removeColorImage(blockId, idx) {
  const block = colorBlocks.find(b => b.id === blockId);
  if (!block) return;
  block.previews.splice(idx, 1);
  let fileIdx = 0;
  for (let i = 0; i < block.previews.length + 1; i++) {
    if (i < idx && !block.previews[i]?.isExisting) fileIdx++;
  }
  if (!block.previews[idx]?.isExisting && idx < block.files.length) {
    block.files.splice(fileIdx, 1);
  }
  renderColorPreview(blockId);
}

function getColorsData() {
  return colorBlocks.map(b => {
    const nameInput = document.querySelector(`#${b.id} .color-name-input`);
    const name = nameInput ? nameInput.value.trim() : '';
    const existingImages = b.previews.filter(p => p.isExisting).map(p => p.serverUrl);
    return { nom: name, images: existingImages };
  }).filter(c => c.nom);
}

function clearColorBlocks() {
  document.getElementById('colors-container').innerHTML = '';
  colorBlocks = [];
}

// ============================================
// FORM
// ============================================

function editProduit(p) {
  editingProductId = p.id;
  
  document.getElementById('edit-id').value = p.id;
  document.getElementById('form-nom').value = p.nom || '';
  document.getElementById('form-prix').value = p.prix || '';
  document.getElementById('form-categorie').value = p.categorie || '';
  document.getElementById('form-promotion').value = p.promotion || 0;
  document.getElementById('form-disponible').checked = p.disponible !== false;
  document.getElementById('form-description').value = p.description || '';

  setSizes(p.tailles || []);

  clearColorBlocks();
  if (p.couleurs && p.couleurs.length) {
    p.couleurs.forEach(c => addColorBlock(c));
  }

  setDisponibiliteData(p.disponibilite || []);
  renderDisponibiliteMatrix();

  document.getElementById('form-title').textContent = 'MODIFIER PRODUIT';
  document.getElementById('btn-submit').textContent = 'METTRE A JOUR';

  if (p.image) {
    const preview = document.getElementById('image-preview');
    preview.src = p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`;
    preview.classList.remove('hidden');
    document.getElementById('upload-placeholder').classList.add('hidden');
    document.getElementById('btn-remove-img').classList.remove('hidden');
  }

  showSection('ajouter');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector('.nav-link[data-section="ajouter"]').classList.add('active');
}

function resetForm() {
  editingProductId = null;
  
  document.getElementById('produit-form').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('form-title').textContent = 'NOUVEAU PRODUIT';
  document.getElementById('btn-submit').textContent = 'ENREGISTRER';

  document.getElementById('image-preview').classList.add('hidden');
  document.getElementById('upload-placeholder').classList.remove('hidden');
  document.getElementById('btn-remove-img').classList.add('hidden');
  document.getElementById('form-image').value = '';

  selectedSizes.clear();
  document.querySelectorAll('.size-chip').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.size-chip').forEach(btn => {
    if (!['S','M','L','XL','XXL','TU'].includes(btn.dataset.size)) btn.remove();
  });
  updateSizesInput();

  clearColorBlocks();
  
  disponibiliteData = [];
  renderDisponibiliteMatrix();
}

function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      const preview = document.getElementById('image-preview');
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      document.getElementById('upload-placeholder').classList.add('hidden');
      document.getElementById('btn-remove-img').classList.remove('hidden');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function removeImage() {
  document.getElementById('form-image').value = '';
  document.getElementById('image-preview').classList.add('hidden');
  document.getElementById('upload-placeholder').classList.remove('hidden');
  document.getElementById('btn-remove-img').classList.add('hidden');
}

async function submitProduit(e) {
  e.preventDefault();

  const id = document.getElementById('edit-id').value;
  const formData = new FormData();

  formData.append('nom', document.getElementById('form-nom').value);
  formData.append('prix', document.getElementById('form-prix').value);
  formData.append('categorie', document.getElementById('form-categorie').value);
  formData.append('promotion', document.getElementById('form-promotion').value);
  formData.append('disponible', document.getElementById('form-disponible').checked);
  formData.append('description', document.getElementById('form-description').value);

  const tailles = [...selectedSizes];
  formData.append('tailles', JSON.stringify(tailles));

  const imageFile = document.getElementById('form-image').files[0];
  if (imageFile) formData.append('image', imageFile);

  const colorsData = getColorsData();

  for (let i = 0; i < colorBlocks.length; i++) {
    const block = colorBlocks[i];
    const newPreviews = block.previews.filter(p => !p.isExisting);
    if (newPreviews.length > 0) {
      const colorForm = new FormData();
      newPreviews.forEach(p => {
        colorForm.append('images', p.file);
      });
      try {
        const res = await fetch(`${API_BASE}/api/admin/upload-color-images`, {
          method: 'POST',
          headers: { 'X-Admin-Password': authPassword },
          body: colorForm
        });
        if (res.ok) {
          const data = await res.json();
          if (data.urls) {
            colorsData[i].images.push(...data.urls);
          }
        }
      } catch (err) {
        console.error('Erreur upload images couleur:', err);
      }
    }
  }

  formData.append('couleurs', JSON.stringify(colorsData));
  formData.append('disponibilite', JSON.stringify(getDisponibiliteData()));

  try {
    const url = id ? `/api/admin/produits/${id}` : '/api/admin/produits';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(`${API_BASE}${url}`, {
      method,
      headers: { 'X-Admin-Password': authPassword },
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erreur serveur');
    }

    toast(id ? 'Produit mis a jour' : 'Produit cree', 'success');
    resetForm();
    loadStats();
    showSection('overview');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[data-section="overview"]').classList.add('active');

  } catch (err) {
    toast(err.message, 'error');
  }
}

// ============================================
// DELETE
// ============================================

function askDelete(id) {
  deleteTargetId = id;
  document.getElementById('modal-delete').classList.remove('hidden');
}

function closeModal() {
  deleteTargetId = null;
  document.getElementById('modal-delete').classList.add('hidden');
}

async function confirmDelete() {
  if (!deleteTargetId) return;

  try {
    await api(`/api/admin/produits/${deleteTargetId}`, { method: 'DELETE' });
    toast('Produit supprime', 'success');
    closeModal();
    loadProduits();
    loadStats();
  } catch (e) {
    toast('Erreur suppression: ' + e.message, 'error');
  }
}

// ============================================
// TOAST
// ============================================

function toast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// INIT
// ============================================

document.getElementById('password-input').addEventListener('keypress', e => {
  if (e.key === 'Enter') doLogin();
});

if (authPassword) {
  fetch(`${API_BASE}/api/admin/stats`, {
    headers: { 'X-Admin-Password': authPassword }
  })
  .then(res => {
    if (res.ok) showDashboard();
    else logout();
  })
  .catch(() => {
    document.getElementById('login-error').textContent = 'Serveur non disponible';
  });
}