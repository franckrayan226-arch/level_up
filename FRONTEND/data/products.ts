import { fetchProducts, type ApiProduct } from '../api';

export interface Product {
  id: string;
  name: string;
  price: number;
  livraison: number;
  sizes: string[];
  colors: { name: string; hex: string; images: string[] }[];
  image: string;
  description: string;
  promotion?: number;
  stock?: number;
  disponible?: boolean;
  disponibilite?: { taille: string; couleur: string; disponible: boolean }[];
  categorie?: string;
}

// ============================================
// DONNÉES DE FALLBACK (affichage immédiat)
// ============================================
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'M01 HEAVY TEE',
    price: 50000,
    livraison: 1000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000', images: [] },
      { name: 'GREY', hex: '#808080', images: [] },
      { name: 'WHITE', hex: '#F3F3F3', images: [] }
    ],
    image: '/hero-image.png',
    description: 'Minimalist heavy cotton black oversized t-shirt.'
  },
  {
    id: '2',
    name: 'M02 OVERSIZED HOODIE',
    price: 75000,
    livraison: 1000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000', images: [] },
      { name: 'GREY', hex: '#808080', images: [] }
    ],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop',
    description: 'Premium oversized hoodie with heavyweight fabric.'
  },
  {
    id: '3',
    name: 'M03 CARGO PANTS',
    price: 65000,
    livraison: 1000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000', images: [] },
      { name: 'KHAKI', hex: '#C3B091', images: [] }
    ],
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop',
    description: 'Technical cargo pants with multiple pockets.'
  },
  {
    id: '4',
    name: 'M04 TECH JACKET',
    price: 95000,
    livraison: 1000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000', images: [] }
    ],
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop',
    description: 'Water-resistant technical jacket for urban environments.'
  }
];

// ============================================
// CACHE
// ============================================
let cachedProducts: Product[] | null = null;

// ============================================
// EXPORT SYNCHRONE (pour l'ancien code)
// ============================================
export const products = fallbackProducts;

// ============================================
// FONCTIONS ASYNCHRONES
// ============================================
export async function getProducts(): Promise<Product[]> {
  try {
    const produits = await fetchProducts();
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

    const mappedProducts = produits.map((p: ApiProduct) => ({
      id: p.id,
      name: p.nom,
      price: p.prix,
      livraison: p.livraison || 1000,
      sizes: p.tailles || ['S', 'M', 'L', 'XL'],
      colors: (p.couleurs || []).map(c => ({
        name: c.nom,
        hex: '#000000',
        images: c.images || []
      })),
      image: p.image ? `${BASE_URL}${p.image}` : '',
      description: p.description || '',
      promotion: p.promotion || 0,
      stock: p.stock || 0,
      disponible: p.disponible,
      disponibilite: p.disponibilite || [],
      categorie: p.categorie
    }));

    cachedProducts = mappedProducts;
    return mappedProducts;

  } catch (e) {
    console.warn('Backend offline, fallback aux données locales:', e);
    return fallbackProducts;
  }
}

export function getProductById(id: string): Product | undefined {
  return cachedProducts?.find(p => p.id === id) || fallbackProducts.find(p => p.id === id);
}