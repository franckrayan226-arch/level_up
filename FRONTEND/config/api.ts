// En dev : localhost:8080, en prod : même domaine (URL relative)
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api' 
  : '/api';

export async function fetchProduits() {
  const res = await fetch(`${API_BASE}/produits`);
  if (!res.ok) throw new Error('Erreur chargement produits');
  return res.json();
}

export async function fetchProduit(id: string) {
  const res = await fetch(`${API_BASE}/produits/${id}`);
  if (!res.ok) throw new Error('Produit non trouvé');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Erreur chargement catégories');
  return res.json();
}