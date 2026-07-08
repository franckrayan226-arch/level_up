import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, type ApiProduct } from '../api';

export default function Shop() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <p className="text-red-500 text-center">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tighter uppercase">ALL PRODUCTS</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12">
        {products.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="flex flex-col gap-4 group">
            <div className="aspect-[3/4] bg-white overflow-hidden">
              <img 
                src={product.image || '/placeholder.png'} 
                alt={product.nom} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-headline font-bold text-base leading-tight uppercase tracking-tight">{product.nom}</h3>
              <div className="flex flex-col xl:flex-row justify-between xl:items-baseline gap-1">
                <span className="font-body text-xs font-medium text-zinc-500 whitespace-nowrap">
                  {product.promotion > 0 
                    ? Math.round(product.prix * (1 - product.promotion/100)).toLocaleString('fr-FR') 
                    : product.prix.toLocaleString('fr-FR')} FCFA
                </span>
                <span className="font-body text-[9px] font-bold text-zinc-400 tracking-tighter uppercase">{product.categorie}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-24 mb-12">
        <h2 className="font-headline font-black text-4xl leading-none uppercase tracking-tighter mb-4">SEASON 04<br/>COLLECTION</h2>
        <p className="font-body text-xs text-zinc-500 leading-relaxed max-w-[280px] uppercase tracking-widest">A study in architectural form and urban utility. High-density textiles meet relaxed silhouettes.</p>
      </div>
    </div>
  );
}