import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, getImageUrl, type ApiProduct } from '../api';
import HeroLogo from '../components/HeroLogo';
import StarGlyph from '../components/StarGlyph';

const RED = '#E6320F';

function PriceBlock({ product }: { product: ApiProduct }) {
  const prixFinal = product.promotion > 0
    ? Math.round(product.prix * (1 - product.promotion / 100))
    : product.prix;
  const prixAvecLivraison = prixFinal + (product.livraison || 1000);
  const hasLowStock = product.disponibilite?.some(d => d.disponible && d.stock > 0 && d.stock < 5);

  return (
    <div className="text-right shrink-0">
      {product.promotion > 0 && (
        <p className="font-label font-bold uppercase tracking-widest text-[9px] md:text-[11px] text-[#E6320F]">
          -{product.promotion}%
        </p>
      )}
      <p
        className={`font-headline font-black tracking-tighter whitespace-nowrap text-sm md:text-base ${product.promotion > 0 ? 'text-[#E6320F]' : 'text-black'}`}
      >
        {prixFinal.toLocaleString('fr-FR')} FCFA
      </p>
      {product.promotion > 0 && (
        <p className="font-body text-[9px] text-zinc-400 line-through">
          {product.prix.toLocaleString('fr-FR')} FCFA
        </p>
      )}
      <p className="font-body text-[9px] text-zinc-400 tracking-wider">
        + livr. {prixAvecLivraison.toLocaleString('fr-FR')}
      </p>
      {hasLowStock && (
        <p className="font-body text-[9px] tracking-wider mt-0.5 text-[#E6320F]">Stock limité</p>
      )}
    </div>
  );
}

function ProductCard({ product, index }: { product: ApiProduct; index: number }) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative bg-zinc-100 border border-zinc-200 mb-3 overflow-hidden transition-colors duration-300 group-hover:border-black aspect-[3/4]">
        <img
          src={getImageUrl(product.image)}
          alt={product.nom}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 bg-black text-white px-2 py-1 md:px-2.5 md:py-1 font-label text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase">
          {String(index + 1).padStart(2, '0')}
        </div>
        {product.promotion > 0 && (
          <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 bg-[#E6320F] text-white px-2 py-1 md:px-2.5 md:py-1 font-label text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
            -{product.promotion}%
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-black text-white py-2.5 md:py-3 flex items-center justify-center gap-2">
          <span className="font-label text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em]">Voir le produit</span>
          <StarGlyph variant="outline" className="w-2.5 h-2.5 shrink-0 text-white" />
        </div>
      </div>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-headline font-black uppercase tracking-tighter leading-tight text-sm md:text-base">
            {product.nom}
          </p>
          <p className="font-body text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest mt-1 truncate">
            {product.description?.substring(0, 40) || 'LEVEL UP'}
          </p>
        </div>
        <PriceBlock product={product} />
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayProducts = products.slice(0, 8);

  return (
    <div className="pt-20 pb-24">
      <section className="relative h-[70vh] min-h-[480px] md:h-[80vh] md:min-h-[750px] w-full overflow-hidden bg-surface border-b border-black flex flex-col items-center justify-center">
        <HeroLogo />
        <div className="relative z-30 w-full h-full max-w-7xl mx-auto flex flex-col justify-end items-center px-4 sm:px-6 pb-16 md:pb-20 pointer-events-none">
          <div className="flex flex-col items-center mt-auto w-full pointer-events-auto">
            <Link to="/shop" className="lu-cta-rise bg-transparent border border-black text-black font-headline font-bold text-[10px] sm:text-xs md:text-sm px-10 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 tracking-[0.2em] hover:bg-black hover:text-white active:bg-zinc-800 transition-all duration-300 uppercase w-fit backdrop-blur-sm sm:backdrop-blur-[2px]">
              Decouvrir la Boutique
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10 md:mb-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="font-label text-[10px] md:text-xs tracking-[0.3em] text-zinc-500 uppercase">Seasonal Drop</span>
              <h3 className="font-headline font-black text-3xl md:text-5xl tracking-tighter uppercase mt-1">New Arrivals</h3>
            </div>
            <Link
              to="/shop"
              className="border border-black px-6 py-2.5 md:px-8 md:py-3 font-headline font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300"
            >
              View All
            </Link>
          </div>
          <div className="lu-ruler h-3 w-full mt-6 md:mt-8 opacity-70" aria-hidden="true" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14 px-4 md:px-6 max-w-7xl mx-auto">
            {displayProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="py-20 md:py-28 px-4 md:px-6 flex flex-col items-center text-center bg-surface border-t border-black relative overflow-hidden">
        <div className="flex items-center gap-3 md:gap-4 mb-6">
          <StarGlyph variant="outline" className="w-3 h-3 text-black shrink-0" />
          <span className="font-label text-[10px] md:text-xs tracking-[0.45em] text-zinc-500 uppercase">Stay Informed</span>
          <StarGlyph variant="outline" className="w-3 h-3 text-black shrink-0" />
        </div>
        <h2 className="font-headline font-black text-3xl md:text-6xl tracking-tighter uppercase max-w-2xl mb-10 leading-none">
          Rejoignez l'archive pour les drops exclusifs
        </h2>
        <div className="w-full max-w-md flex flex-col gap-4">
          <input
            type="email"
            placeholder="ADRESSE EMAIL"
            className="bg-transparent border-0 border-b border-black py-4 px-0 font-label tracking-widest focus:ring-0 focus:border-[#E6320F] transition-colors text-center uppercase text-xs outline-none placeholder:text-zinc-300"
          />
          <button
            className="bg-black text-white font-headline font-bold py-5 tracking-widest hover:bg-[#E6320F] transition-colors duration-300 mt-4 uppercase"
          >
            S'abonner
          </button>
        </div>
      </section>
    </div>
  );
}
