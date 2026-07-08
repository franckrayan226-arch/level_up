import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { fetchProduct, type ApiProduct } from '../api';
import { useCart } from '../context/CartContext';
import { BrandLogo } from '../components/BrandLogo';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState({ name: 'Noir', hex: '#000000' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="pt-20 pb-24 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20 pb-24 px-6 text-center">
        <p className="text-red-500">Produit non trouvé</p>
        <Link to="/shop" className="text-primary underline mt-4 inline-block">Retour à la boutique</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.nom,
      price: product.promotion > 0 
        ? Math.round(product.prix * (1 - product.promotion/100))
        : product.prix,
      size: selectedSize,
      color: selectedColor.name,
      image: product.image || '/placeholder.png',
      quantity: 1
    });
  };

  const prixFinal = product.promotion > 0 
    ? Math.round(product.prix * (1 - product.promotion/100))
    : product.prix;

  return (
    <div className="pt-20 pb-24 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Image */}
        <div className="lg:col-span-7 bg-white relative aspect-[3/4] md:aspect-auto md:h-[calc(100vh-80px)] overflow-hidden">
          <img 
            src={product.image || '/placeholder.png'} 
            alt={product.nom} 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Details */}
        <div className="lg:col-span-5 px-6 py-12 lg:px-16 lg:py-20 flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase mb-2 block">ESSENTIALS ARCHIVE</span>
                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4 md:mb-0 font-headline">{product.nom}</h1>
              </div>
              <span className="text-2xl font-headline font-bold whitespace-nowrap shrink-0">
                {prixFinal.toLocaleString('fr-FR')} FCFA
                {product.promotion > 0 && (
                  <span className="text-sm text-zinc-400 line-through ml-2">{product.prix.toLocaleString('fr-FR')} FCFA</span>
                )}
              </span>
            </div>
            
            <div className="mb-10 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.disponible ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-body">
                {product.disponible ? 'EN STOCK' : 'RUPTURE DE STOCK'}
              </span>
            </div>
            
            <p className="font-body text-sm leading-relaxed text-on-surface-variant mb-12 max-w-md">
              {product.description}
            </p>

            <div className="space-y-12">
              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <span className="font-headline font-extrabold text-xs tracking-widest uppercase">SELECT SIZE</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-14 flex items-center justify-center font-bold text-xs transition-colors ${selectedSize === size ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-zinc-400 hover:bg-zinc-200'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <button 
              onClick={handleAddToCart}
              disabled={!product.disponible}
              className="w-full bg-primary text-on-primary h-20 font-headline font-black text-xl tracking-tighter uppercase flex items-center justify-center gap-4 hover:bg-primary-fixed transition-colors active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.disponible ? 'ADD TO COMMANDER' : 'INDISPONIBLE'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Section */}
      <div className="mt-20 px-6 py-20 bg-surface-container-low flex flex-col items-center text-center">
        <Zap className="w-10 h-10 mb-6" />
        <h2 className="text-4xl font-black uppercase tracking-tighter max-w-xl mb-6 font-headline flex items-center justify-center flex-wrap gap-x-2">
          <span>ENGINEERED FOR THE URBAN</span> <BrandLogo />.
        </h2>
        <div className="w-20 h-1 bg-black mb-6"></div>
        <p className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase font-body">ESTABLISHED MMXXIV — TOKYO / BERLIN / NYC</p>
      </div>
    </div>
  );
}