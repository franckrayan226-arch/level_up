const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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