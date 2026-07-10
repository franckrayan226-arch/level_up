import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { fetchProduct, getImageUrl, isCombinationAvailable, getStockForCombination, type ApiProduct } from '../api';
import { useCart } from '../context/CartContext';
import { BrandLogo } from '../components/BrandLogo';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then(data => {
        setProduct(data);
        if (data.tailles && data.tailles.length > 0) {
          setSelectedSize(data.tailles[0]);
        }
        if (data.couleurs && data.couleurs.length > 0) {
          setSelectedColor(data.couleurs[0].nom);
        }
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
        <p className="text-red-500">Produit non trouve</p>
        <Link to="/shop" className="text-primary underline mt-4 inline-block">Retour a la boutique</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) { alert('Veuillez choisir une taille'); return; }
    if (!selectedColor) { alert('Veuillez choisir une couleur'); return; }

    if (!isCombinationAvailable(product, selectedSize, selectedColor)) {
      alert('Cette combinaison taille/couleur est actuellement indisponible');
      return;
    }

    const stockRestant = getStockForCombination(product, selectedSize, selectedColor);
    if (stockRestant <= 0) {
      alert('Stock epuise pour cette combinaison');
      return;
    }

    const prixFinal = product.promotion > 0 
      ? Math.round(product.prix * (1 - product.promotion/100))
      : product.prix;

    addToCart({
      productId: product.id,
      name: product.nom,
      price: prixFinal,
      livraison: product.livraison || 1000,
      size: selectedSize,
      color: selectedColor,
      image: product.image || '/placeholder.png',
      quantity: 1
    });
  };

  const prixFinal = product.promotion > 0 
    ? Math.round(product.prix * (1 - product.promotion/100))
    : product.prix;

  const prixAvecLivraison = prixFinal + (product.livraison || 1000);

  const currentColor = product.couleurs?.[selectedColorIndex];
  const colorImages = currentColor?.images || [];
  const mainImage = colorImages.length > 0 
    ? getImageUrl(colorImages[currentImageIndex])
    : getImageUrl(product.image);

  const comboAvailable = selectedSize && selectedColor 
    ? isCombinationAvailable(product, selectedSize, selectedColor) 
    : true;

  const stockRestant = selectedSize && selectedColor
    ? getStockForCombination(product, selectedSize, selectedColor)
    : 0;

  return (
    <div className="pt-20 pb-24 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 bg-white relative">
          <div className="aspect-[3/4] md:aspect-auto md:h-[calc(100vh-80px)] overflow-hidden relative">
            <img 
              src={mainImage}
              alt={product.nom}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {colorImages.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
              {colorImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 border-2 flex-shrink-0 overflow-hidden ${
                    idx === currentImageIndex ? 'border-black' : 'border-zinc-200'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 px-6 py-12 lg:px-16 lg:py-20 flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase mb-2 block">ESSENTIALS ARCHIVE</span>
                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4 md:mb-0 font-headline">{product.nom}</h1>
              </div>
              <div className="text-right">
                <span className="text-2xl font-headline font-bold whitespace-nowrap shrink-0 block">
                  {prixFinal.toLocaleString('fr-FR')} FCFA
                </span>
                {product.promotion > 0 && (
                  <span className="text-sm text-zinc-400 line-through block">{product.prix.toLocaleString('fr-FR')} FCFA</span>
                )}
                <span className="text-xs text-zinc-500 mt-1 block">
                  + {product.livraison || 1000} FCFA livraison
                </span>
                <span className="text-sm font-bold text-black mt-1 block">
                  Total: {prixAvecLivraison.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="mb-10 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.disponible && stockRestant > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-body">
                {product.disponible && stockRestant > 0 ? `${stockRestant} EN STOCK` : 'RUPTURE DE STOCK'}
              </span>
            </div>

            <p className="font-body text-sm leading-relaxed text-on-surface-variant mb-12 max-w-md">
              {product.description}
            </p>

            <div className="space-y-12">
              {product.couleurs && product.couleurs.length > 0 && (
                <div>
                  <span className="font-headline font-extrabold text-xs tracking-widest uppercase mb-4 block">SELECT COLOR</span>
                  <div className="flex gap-3">
                    {product.couleurs.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => { 
                          setSelectedColor(color.nom); 
                          setSelectedColorIndex(idx);
                          setCurrentImageIndex(0);
                        }}
                        className={`px-4 py-3 border text-xs font-bold tracking-widest uppercase transition-all ${
                          selectedColor === color.nom 
                            ? 'border-black bg-black text-white' 
                            : 'border-zinc-200 text-zinc-500 hover:border-zinc-400'
                        }`}
                      >
                        {color.nom}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.tailles && product.tailles.length > 0 && (
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="font-headline font-extrabold text-xs tracking-widest uppercase">SELECT SIZE</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.tailles.map(size => {
                      const sizeStock = getStockForCombination(product, size, selectedColor);
                      const sizeAvailable = isCombinationAvailable(product, size, selectedColor);
                      return (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={!sizeAvailable}
                          className={`h-14 flex items-center justify-center font-bold text-xs transition-colors relative ${
                            selectedSize === size 
                              ? 'bg-black text-white' 
                              : sizeAvailable
                                ? 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                                : 'bg-zinc-50 text-zinc-300 cursor-not-allowed line-through'
                          }`}
                        >
                          {size}
                          {sizeStock > 0 && sizeStock < 5 && sizeAvailable && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center">
                              {sizeStock}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {!comboAvailable && selectedSize && selectedColor && (
                    <p className="text-[10px] text-red-500 mt-3 font-body font-bold tracking-widest uppercase">
                      INDISPONIBLE EN {selectedSize} / {selectedColor}
                    </p>
                  )}
                  {comboAvailable && stockRestant > 0 && stockRestant < 5 && (
                    <p className="text-[10px] text-orange-500 mt-3 font-body font-bold tracking-widest uppercase">
                      Plus que {stockRestant} en stock !
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-16">
            <button 
              onClick={handleAddToCart}
              disabled={!product.disponible || !comboAvailable || stockRestant <= 0}
              className="w-full bg-black text-white h-20 font-headline font-black text-xl tracking-tighter uppercase flex items-center justify-center gap-4 hover:bg-zinc-800 transition-colors active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!product.disponible ? 'INDISPONIBLE' : stockRestant <= 0 ? 'STOCK EPUISE' : !comboAvailable ? 'COMBINAISON INDISPONIBLE' : 'ADD TO COMMANDER'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20 px-6 py-20 bg-zinc-100 flex flex-col items-center text-center">
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