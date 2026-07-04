// ============================================
// MONOLITH EDITORIAL — DASHBOARD LOGIC
// ============================================

// Détecte automatiquement l'URL de l'API
const API_BASE = window.location.origin.includes('localhost') 
  ? 'http://localhost:3001' 
  : '';

let currentProduits = [];
let deleteTargetId = null;
let authPassword = localStorage.getItem('monolith_auth') || '';

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
    error.textContent = 'Erreur de connexion — verifiez que le serveur est lance';
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
  
  // Trouve le lien correspondant et l'active
  const link = document.querySelector(`a[href="#${section}"]`);
  if (link) link.classList.add('active');
  
  if (section === 'overview') loadStats();
  if (section === 'produits') loadProduits();
  if (section === 'ajouter') resetForm();
}

// ============================================
// API
// ============================================

async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log('API call:', url); // Debug
  
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
    const imageUrl = p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`) : '';
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
    const imageUrl = p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`) : '';
    return `
      <tr>
        <td>
          <img src="${imageUrl}" class="table-img" alt="" onerror="this.style.display='none'">
        </td>
        <td>
          <div class="table-name">${escapeHtml(p.nom)}</div>
          ${p.description ? `<div style="font-size:11px;color:var(--text-dim);margin-top:4px">${escapeHtml(p.description.substring(0, 50))}...</div>` : ''}
        </td>
        <td><span class="table-cat">${escapeHtml(p.categorie) || '—'}</span></td>
        <td>
          <span class="table-price ${p.promotion > 0 ? 'table-price-promo' : ''}">
            ${prixFinal} FCFA
          </span>
          ${p.promotion > 0 ? `<span class="table-price-original">${p.prix}</span>` : ''}
        </td>
        <td>
          <button class="table-status" onclick="toggleDisponible('${p.id}', ${p.disponible !== false})">
            <span class="status-dot ${p.disponible !== false ? 'dispo' : 'rupture'}"></span>
            ${p.disponible !== false ? 'DISPONIBLE' : 'RUPTURE'}
          </button>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon" onclick='editProduit(${JSON.stringify(p)})' title="Modifier">
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
      (p.categorie && p.categorie.toLowerCase().includes(search))
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
// FORM
// ============================================

function editProduit(p) {
  document.getElementById('edit-id').value = p.id;
  document.getElementById('form-nom').value = p.nom || '';
  document.getElementById('form-prix').value = p.prix || '';
  document.getElementById('form-categorie').value = p.categorie || '';
  document.getElementById('form-promotion').value = p.promotion || 0;
  document.getElementById('form-stock').value = p.stock || 0;
  document.getElementById('form-disponible').checked = p.disponible !== false;
  document.getElementById('form-description').value = p.description || '';
  
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
  document.querySelector('a[href="#ajouter"]').classList.add('active');
}

function resetForm() {
  document.getElementById('produit-form').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('form-title').textContent = 'NOUVEAU PRODUIT';
  document.getElementById('btn-submit').textContent = 'ENREGISTRER';
  
  document.getElementById('image-preview').classList.add('hidden');
  document.getElementById('upload-placeholder').classList.remove('hidden');
  document.getElementById('btn-remove-img').classList.add('hidden');
  document.getElementById('form-image').value = '';
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
  formData.append('stock', document.getElementById('form-stock').value);
  formData.append('disponible', document.getElementById('form-disponible').checked);
  formData.append('description', document.getElementById('form-description').value);
  
  const imageFile = document.getElementById('form-image').files[0];
  if (imageFile) formData.append('image', imageFile);
  
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
    document.querySelector('a[href="#overview"]').classList.add('active');
    
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

// Auto-login
if (authPassword) {
  fetch(`${API_BASE}/api/admin/stats`, {
    headers: { 'X-Admin-Password': authPassword }
  })
  .then(res => {
    if (res.ok) showDashboard();
    else logout();
  })
  .catch(() => {
    document.getElementById('login-error').textContent = 'Serveur non disponible — lancez "npm start" dans le dossier backend';
  });
}