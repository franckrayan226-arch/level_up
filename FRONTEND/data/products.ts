import { fetchProduits } from '../config/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  image: string;
  description: string;
  promotion?: number;
  stock?: number;
  disponible?: boolean;
  categorie?: string;
}

// ============================================
// DONNÉES DE FALLBACK (4 produits minimum)
// ============================================
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'M01 HEAVY TEE',
    price: 50000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000' },
      { name: 'GREY', hex: '#808080' },
      { name: 'WHITE', hex: '#F3F3F3' }
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdf0KWVSbRiMPrD3xgC6-v8HdZfvGMoeThRnUH0-bxDrDuMft0yKsNMeH80zXEoIhdnDZDTtg9o_bmyvPqZGRyFCJQIZ9ZlR9vbB7K16z0WwOheDTFAOqEnEXQFY9sim78-MpODTdgZ2JVuOFoEp0JsK4eLg9JydOoE7IQKAH7-WFW3HXh447gqD-WkycMnV3Vr5UA2E2j6g3IyejVogWvV6JQLp9Ncjin1W31LNd0vrMlQOswV0u-L2CshAyVOEWClP5GaJMGbtrm',
    description: 'Minimalist heavy cotton black oversized t-shirt.'
  },
  {
    id: '2',
    name: 'M02 OVERSIZED HOODIE',
    price: 75000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000' },
      { name: 'GREY', hex: '#808080' }
    ],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop',
    description: 'Premium oversized hoodie with heavyweight fabric.'
  },
  {
    id: '3',
    name: 'M03 CARGO PANTS',
    price: 65000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000' },
      { name: 'KHAKI', hex: '#C3B091' }
    ],
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop',
    description: 'Technical cargo pants with multiple pockets.'
  },
  {
    id: '4',
    name: 'M04 TECH JACKET',
    price: 95000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'BLACK', hex: '#000000' }
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
// EXPORT POUR L'ANCIEN CODE SYNCHRONE
// ============================================
export const products = fallbackProducts;

// ============================================
// FONCTIONS ASYNCHRONES
// ============================================
export async function getProducts(): Promise<Product[]> {
  try {
    const produits = await fetchProduits();
    const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
    
    const mappedProducts = produits.map((p: any) => ({
      id: p.id,
      name: p.nom,
      price: p.prix,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'BLACK', hex: '#000000' }],
      image: p.image ? `${BASE_URL}${p.image}` : '',
      description: p.description || '',
      promotion: p.promotion || 0,
      stock: p.stock || 0,
      disponible: p.disponible,
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