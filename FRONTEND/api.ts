// En dev : localhost:8080, en prod : même domaine (URL relative)
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api' 
  : '/api';

export interface ApiProduct {
  id: string;
  nom: string;
  prix: number;
  livraison: number;
  description: string;
  categorie: string;
  promotion: number;
  stock: number;
  disponible: boolean;
  image: string | null;
  tailles: string[];
  couleurs: { nom: string; images: string[] }[];
  dateAjout: string;
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_BASE}/produits`);
  if (!res.ok) throw new Error('Erreur chargement produits');
  return res.json();
}

export async function fetchProduct(id: string): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE}/produits/${id}`);
  if (!res.ok) throw new Error('Produit non trouvé');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Erreur chargement catégories');
  return res.json();
}

export function getImageUrl(image: string | null): string {
  if (!image) return '/placeholder.png';
  if (image.startsWith('http')) return image;
  const base = API_BASE.replace('/api', '');
  return `${base}${image}`;
}