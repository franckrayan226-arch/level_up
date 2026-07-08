import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, getImageUrl, type ApiProduct } from '../api';

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
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[550px] md:min-h-[750px] w-full overflow-hidden bg-[#E2E2E2] flex flex-col items-center justify-center">
        <div className="absolute inset-0 w-full h-full max-w-7xl mx-auto px-0 md:px-6">
          <img 
            src="/hero-image.png" 
            alt="LEVEL-UP Streetwear Model" 
            className="w-full h-full object-cover object-[center_10%] md:object-contain md:object-bottom mix-blend-multiply opacity-100"
          />
        </div>
        <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col justify-end items-center px-4 sm:px-6 pb-10 md:pb-16 pointer-events-none">
          <div className="flex flex-col items-center mt-auto w-full pointer-events-auto">
            <Link to="/shop" className="bg-transparent border border-black text-black font-headline font-bold text-[10px] sm:text-xs md:text-sm px-10 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 tracking-[0.2em] hover:bg-black hover:text-white active:bg-zinc-800 transition-all duration-300 uppercase w-fit backdrop-blur-sm sm:backdrop-blur-[2px]">
              Découvrir la Boutique
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="px-4 md:px-6 mb-12 md:mb-16 flex justify-between items-end">
          <div>
            <span className="font-label text-[10px] md:text-xs tracking-[0.3em] text-outline uppercase">Seasonal Drop</span>
            <h3 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tighter uppercase mt-1">NEW ARRIVALS</h3>
          </div>
          <Link to="/shop" className="font-label text-[10px] md:text-xs tracking-widest border-b border-primary pb-1 font-bold uppercase">VIEW ALL</Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12 md:gap-y-20 gap-x-4 md:gap-x-6 px-4 md:px-6">
            {displayProducts[0] && (
              <Link to={`/product/${displayProducts[0].id}`} className="col-span-2 md:col-span-8 group block">
                <div className="aspect-[4/5] md:aspect-[16/9] bg-white mb-4 md:mb-6 relative overflow-hidden">
                  <img 
                    src={getImageUrl(displayProducts[0].image)} 
                    alt={displayProducts[0].nom}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  /> 
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-black text-white px-3 py-1 md:px-4 md:py-2 text-[10px] md:text-xs font-bold tracking-widest uppercase font-headline">01</div>
                </div>
                <div className="flex flex-col xl:flex-row justify-between items-start pt-2 md:w-3/4 gap-1 xl:gap-4">
                  <div>
                    <p className="font-headline font-black text-lg md:text-3xl tracking-tighter uppercase">{displayProducts[0].nom}</p>
                    <p className="font-body text-[10px] md:text-sm text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">{displayProducts[0].description?.substring(0, 60)}...</p>
                  </div>
                  <p className="font-headline font-black text-lg md:text-2xl tracking-tighter whitespace-nowrap shrink-0 mt-1 xl:mt-0">
                    {displayProducts[0].promotion > 0 
                      ? Math.round(displayProducts[0].prix * (1 - displayProducts[0].promotion/100)).toLocaleString('fr-FR')
                      : displayProducts[0].prix.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </Link>
            )}

            {displayProducts[1] && (
              <Link to={`/product/${displayProducts[1].id}`} className="col-span-1 md:col-span-4 group block mt-6 md:mt-32">
                <div className="aspect-[3/4] bg-white mb-3 md:mb-6 relative overflow-hidden">
                  <img 
                    src={getImageUrl(displayProducts[1].image)} 
                    alt={displayProducts[1].nom} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black text-white px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold tracking-widest uppercase font-headline">02</div>
                </div>
                <div className="flex flex-col xl:flex-row justify-between items-start pt-2 gap-1 xl:gap-4">
                  <div>
                    <p className="font-headline font-black text-xs md:text-xl tracking-tighter uppercase leading-tight">{displayProducts[1].nom}</p>
                    <p className="font-body text-[9px] md:text-xs text-zinc-500 uppercase tracking-widest mt-1">Essential</p>
                  </div>
                  <p className="font-headline font-black text-xs md:text-xl tracking-tighter whitespace-nowrap shrink-0">
                    {displayProducts[1].promotion > 0 
                      ? Math.round(displayProducts[1].prix * (1 - displayProducts[1].promotion/100)).toLocaleString('fr-FR')
                      : displayProducts[1].prix.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </Link>
            )}

            {displayProducts[2] && (
              <Link to={`/product/${displayProducts[2].id}`} className="col-span-1 md:col-span-5 group block">
                <div className="aspect-[3/4] bg-white mb-3 md:mb-6 relative overflow-hidden">
                  <img 
                    src={getImageUrl(displayProducts[2].image)} 
                    alt={displayProducts[2].nom} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-black text-white px-2 py-1 md:px-3 md:py-1 text-[8px] md:text-[10px] font-bold tracking-widest uppercase font-headline">03</div>
                </div>
                <div className="flex flex-col xl:flex-row justify-between items-start pt-2 gap-1 xl:gap-4">
                  <div>
                    <p className="font-headline font-black text-xs md:text-xl tracking-tighter uppercase leading-tight">{displayProducts[2].nom}</p>
                    <p className="font-body text-[9px] md:text-xs text-zinc-500 uppercase tracking-widest mt-1">Technical</p>
                  </div>
                  <p className="font-headline font-black text-xs md:text-xl tracking-tighter whitespace-nowrap shrink-0">
                    {displayProducts[2].promotion > 0 
                      ? Math.round(displayProducts[2].prix * (1 - displayProducts[2].promotion/100)).toLocaleString('fr-FR')
                      : displayProducts[2].prix.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </Link>
            )}

            {displayProducts[3] && (
              <Link to={`/product/${displayProducts[3].id}`} className="col-span-2 md:col-span-7 group block mt-2 md:mt-[-100px]">
                <div className="aspect-square md:aspect-[4/5] bg-white mb-4 md:mb-6 relative overflow-hidden">
                  <img 
                    src={getImageUrl(displayProducts[3].image)} 
                    alt={displayProducts[3].nom} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-black text-white px-3 py-1 md:px-4 md:py-2 text-[10px] md:text-xs font-bold tracking-widest uppercase font-headline">04</div>
                </div>
                <div className="flex flex-col xl:flex-row justify-between items-start pt-2 md:w-3/4 md:ml-auto gap-1 xl:gap-4">
                  <div>
                    <p className="font-headline font-black text-lg md:text-3xl tracking-tighter uppercase">{displayProducts[3].nom}</p>
                    <p className="font-body text-[10px] md:text-sm text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">{displayProducts[3].description?.substring(0, 60)}...</p>
                  </div>
                  <p className="font-headline font-black text-lg md:text-2xl tracking-tighter whitespace-nowrap shrink-0 mt-1 xl:mt-0">
                    {displayProducts[3].promotion > 0 
                      ? Math.round(displayProducts[3].prix * (1 - displayProducts[3].promotion/100)).toLocaleString('fr-FR')
                      : displayProducts[3].prix.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="py-32 px-6 flex flex-col items-center text-center bg-surface">
        <h5 className="font-label text-xs tracking-[0.5em] text-outline mb-6 uppercase">Stay Informed</h5>
        <h2 className="font-headline font-black text-4xl md:text-6xl tracking-tighter uppercase max-w-2xl mb-10 leading-none">
          JOIN THE ARCHIVE FOR EXCLUSIVE DROPS
        </h2>
        <div className="w-full max-w-md flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="EMAIL ADDRESS" 
            className="bg-transparent border-0 border-b border-outline-variant py-4 px-0 font-label tracking-widest focus:ring-0 focus:border-primary transition-colors text-center uppercase text-xs"
          />
          <button className="bg-primary text-on-primary font-headline font-bold py-5 tracking-widest hover:bg-primary-fixed transition-colors mt-4 uppercase">
            SUBSCRIBE
          </button>
        </div>
      </section>
    </div>
  );
}