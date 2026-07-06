import { Link } from 'react-router-dom';
import { products } from '../data/products';

export default function Shop() {
  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tighter uppercase">ALL PRODUCTS</h1>
      </div>

      {/* Product Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-12">
        {products.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="flex flex-col gap-4 group">
            <div className="aspect-[3/4] bg-white overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-headline font-bold text-base leading-tight uppercase tracking-tight">{product.name}</h3>
              <div className="flex flex-col xl:flex-row justify-between xl:items-baseline gap-1">
                <span className="font-body text-xs font-medium text-zinc-500 whitespace-nowrap">{product.price.toLocaleString('fr-FR')} FCFA</span>
                <span className="font-body text-[9px] font-bold text-zinc-400 tracking-tighter uppercase">{product.sizes.join(' ')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Editorial Section (Spacing/Context) */}
      <div className="mt-24 mb-12">
        <h2 className="font-headline font-black text-4xl leading-none uppercase tracking-tighter mb-4">SEASON 04<br/>COLLECTION</h2>
        <p className="font-body text-xs text-zinc-500 leading-relaxed max-w-[280px] uppercase tracking-widest">A study in architectural form and urban utility. High-density textiles meet relaxed silhouettes.</p>
      </div>
    </div>
  );
}
