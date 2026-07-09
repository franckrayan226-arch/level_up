
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api' 
  : '/api';

export interface DisponibiliteItem {
  taille: string;
  couleur: string;
  disponible: boolean;
}

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
  disponibilite?: DisponibiliteItem[];
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
  if (!res.ok) throw new Error('Produit non trouve');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Erreur chargement categories');
  return res.json();
}

export function getImageUrl(image: string | null): string {
  if (!image) return '/placeholder.png';
  if (image.startsWith('http')) return image;
  const base = API_BASE.replace('/api', '');
  return `${base}${image}`;
}

export function isCombinationAvailable(
  product: ApiProduct,
  taille: string,
  couleur: string
): boolean {
  if (!product.disponible) return false;
  if (!product.disponibilite || product.disponibilite.length === 0) return true;
  const item = product.disponibilite.find(
    d => d.taille === taille && d.couleur === couleur
  );
  return item ? item.disponible : true;
}
