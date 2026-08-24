import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, getImageUrl, type ApiProduct } from '../api';
import HeroLogo from '../components/HeroLogo';
import StarGlyph from '../components/StarGlyph';

const RED = '#E6320F';

function PriceBlock({ product, big = false }: { product: ApiProduct; big?: boolean }) {
  const prixFinal = product.promotion > 0
    ? Math.round(product.prix * (1 - product.promotion / 100))
    : product.prix;
  const prixAvecLivraison = prixFinal + (product.livraison || 1000);
  const hasLowStock = product.disponibilite?.some(d => d.disponible && d.stock > 0 && d.stock < 5);

  return (
    <div className="text-right shrink-0">
      {product.promotion > 0 && (
        <p className={`font-label font-bold uppercase tracking-widest text-[#E6320F] ${big ? 'text-xs md:text-sm' : 'text-[9px] md:text-[11px]'}`}>
          -{product.promotion}%
        </p>
      )}
      <p
        className={`font-headline font-black tracking-tighter whitespace-nowrap ${big ? 'text-lg md:text-2xl mt-1 xl:mt-0' : 'text-xs md:text-xl'} ${product.promotion > 0 ? 'text-[#E6320F]' : 'text-black'}`}
      >
        {prixFinal.toLocaleString('fr-FR')} FCFA
      </p>
      {product.promotion > 0 && (
        <p className="font-body text-[9px] text-zinc-400 line-through">
          {product.prix.toLocaleString('fr-FR')} FCFA
        </p>
      )}
      <p className="font-body text-[9px] text-zinc-400 tracking-wider">
        + livraison: {prixAvecLivraison.toLocaleString('fr-FR')} FCFA
      </p>
      {hasLowStock && (
        <p className="font-body text-[9px] tracking-wider mt-1 text-[#E6320F]">Stock limité</p>
      )}
    </div>
  );
}

function ProductCard({
  product,
  index,
  frameClass,
  className = '',
  textWrapClass = '',
  subtitle = 'Essential',
  big = false,
}: {
  product: ApiProduct;
  index: number;
  frameClass: string;
  className?: string;
  textWrapClass?: string;
  subtitle?: string;
  big?: boolean;
}) {
  return (
    <Link to={`/product/${product.id}`} className={`group block ${className}`}>
      <div
        className={`relative bg-zinc-100 border border-zinc-200 mb-3 md:mb-5 overflow-hidden transition-colors duration-300 group-hover:border-black ${frameClass}`}
      >
        <img
          src={getImageUrl(product.image)}
          alt={product.nom}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black text-white px-2 py-1 md:px-3 md:py-1.5 font-label text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase">
          {String(index + 1).padStart(2, '0')}
        </div>
        {product.promotion > 0 && (
          <div
            className="absolute top-3 right-3 md:top-4 md:right-4 bg-[#E6320F] text-white px-2 py-1 md:px-2.5 md:py-1.5 font-label text-[9px] md:text-[10px] font-bold tracking-widest uppercase"
          >
            -{product.promotion}%
          </div>
        )}
      </div>
      <div className={`flex justify-between items-start gap-2 xl:gap-4 ${textWrapClass}`}>
        <div className="min-w-0">
          <p className={`font-headline font-black uppercase tracking-tighter leading-tight ${big ? 'text-lg md:text-3xl' : 'text-xs md:text-xl'}`}>
            {product.nom}
          </p>
          <p className="font-body text-[9px] md:text-xs text-zinc-500 uppercase tracking-widest mt-1 truncate">
            {subtitle}
          </p>
        </div>
        <PriceBlock product={product} big={big} />
      </div>
    </Link>
  );
}

const INFO_ITEMS = [
  'PAIEMENT À LA LIVRAISON',
  'LIVRAISON PARTOUT AU BURKINA',
  'PRODUITS AUTHENTIQUES',
  'SERVICE CLIENT 226',
];

function InfoTickerRow() {
  return (
    <div className="flex shrink-0 items-center">
      {INFO_ITEMS.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-6 md:px-10 font-label text-[10px] md:text-xs font-bold uppercase tracking-[0.35em] text-black">
            {item}
          </span>
          <StarGlyph variant="outline" className="h-3 w-3 shrink-0 text-black md:h-4 md:w-4" />
        </span>
      ))}
    </div>
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

  const displayProducts = products.slice(0, 4);

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
          <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12 md:gap-y-20 gap-x-4 md:gap-x-6 px-4 md:px-6 max-w-7xl mx-auto">
            {displayProducts[0] && (
              <ProductCard
                product={displayProducts[0]}
                index={0}
                big
                subtitle={displayProducts[0].description?.substring(0, 60) || 'Essential'}
                frameClass="aspect-[4/5] md:aspect-[16/9]"
                className="col-span-2 md:col-span-8"
                textWrapClass="md:w-3/4"
              />
            )}

            {displayProducts[1] && (
              <ProductCard
                product={displayProducts[1]}
                index={1}
                subtitle="Essential"
                frameClass="aspect-[3/4]"
                className="col-span-1 md:col-span-4 mt-6 md:mt-32"
              />
            )}

            {displayProducts[2] && (
              <ProductCard
                product={displayProducts[2]}
                index={2}
                subtitle="Technical"
                frameClass="aspect-[3/4]"
                className="col-span-1 md:col-span-5"
              />
            )}

            {displayProducts[3] && (
              <ProductCard
                product={displayProducts[3]}
                index={3}
                big
                subtitle={displayProducts[3].description?.substring(0, 60) || 'Essential'}
                frameClass="aspect-square md:aspect-[4/5]"
                className="col-span-2 md:col-span-7 mt-2 md:mt-[-100px]"
                textWrapClass="md:w-3/4 md:ml-auto"
              />
            )}
          </div>
        )}
      </section>

      <section className="border-y border-black bg-white py-3 overflow-hidden" aria-hidden="true">
        <div className="lu-marquee flex w-max">
          <InfoTickerRow />
          <InfoTickerRow />
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 md:px-6 flex flex-col items-center text-center bg-surface relative overflow-hidden">
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
            className="bg-[#E6320F] text-white font-headline font-bold py-5 tracking-widest hover:bg-black transition-colors duration-300 mt-4 uppercase"
          >
            S'abonner
          </button>
        </div>
      </section>
    </div>
  );
}
