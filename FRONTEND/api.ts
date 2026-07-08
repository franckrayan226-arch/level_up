// FRONTEND/api.ts
const API_BASE = '';

export interface ApiProduct {
  id: string;
  nom: string;
  prix: number;
  description: string;
  categorie: string;
  promotion: number;
  stock: number;
  disponible: boolean;
  image: string | null;
  dateAjout: string;
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/api/produits`);
  if (!res.ok) throw new Error('Erreur chargement produits');
  return res.json();
}

export async function fetchProduct(id: string): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/api/produits/${id}`);
  if (!res.ok) throw new Error('Produit non trouvé');
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error('Erreur chargement categories');
  return res.json();
}