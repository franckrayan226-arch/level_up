import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { BrandLogo } from '../components/BrandLogo';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.id === id) || products[0];
  
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simulated facets using CSS transforms on the same image
  const productImages = [
    { src: product.image, className: "object-contain" },
    { src: product.image, className: "object-cover scale-[1.5] origin-center" },
    { src: product.image, className: "object-cover scale-[1.2] origin-top" }
  ];

  // Reset selection when product changes
  useEffect(() => {
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
    setCurrentImageIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      image: product.image,
      quantity: 1
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPosition = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollPosition / width);
    setCurrentImageIndex(index);
  };

  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="pt-20 pb-24 max-w-7xl mx-auto">
      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Image Gallery Shell */}
        <div className="lg:col-span-7 bg-white relative aspect-[3/4] md:aspect-auto md:h-[calc(100vh-80px)] overflow-hidden group">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth"
          >
            {productImages.map((img, idx) => (
              <div key={idx} className="flex-shrink-0 w-full h-full snap-center overflow-hidden">
                <img 
                  src={img.src} 
                  alt={`${product.name} - View ${idx + 1}`} 
                  className={`w-full h-full brightness-95 transition-transform duration-700 ${img.className}`}
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
          {/* Gallery Indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 flex gap-2 z-10">
            {productImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => scrollToImage(idx)}
                className={`h-1 transition-all duration-300 ${currentImageIndex === idx ? 'w-12 bg-primary' : 'w-8 bg-primary/20 hover:bg-primary/40'}`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Product Details Shell */}
        <div className="lg:col-span-5 px-6 py-12 lg:px-16 lg:py-20 flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase mb-2 block">ESSENTIALS ARCHIVE</span>
                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4 md:mb-0 font-headline">{product.name}</h1>
              </div>
              <span className="text-2xl font-headline font-bold whitespace-nowrap shrink-0">{product.price.toLocaleString('fr-FR')} FCFA</span>
            </div>
            
            <div className="mb-10 flex items-center gap-2">
              <span className="w-2 h-2 bg-black rounded-full"></span>
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-body">AVAILABILITY: IN STOCK (SHIPS IN 48H)</span>
            </div>
            
            <p className="font-body text-sm leading-relaxed text-on-surface-variant mb-12 max-w-md">
              {product.description}
            </p>

            {/* Selection Controls */}
            <div className="space-y-12">
              {/* Color Selector */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <span className="font-headline font-extrabold text-xs tracking-widest uppercase">COLOR: <span className="text-zinc-400">{selectedColor.name}</span></span>
                </div>
                <div className="flex gap-4">
                  {product.colors.map(color => (
                    <button 
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 transition-transform ${selectedColor.name === color.name ? 'ring-offset-4 ring-1 ring-black' : 'hover:scale-95'}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <span className="font-headline font-extrabold text-xs tracking-widest uppercase">SELECT SIZE</span>
                  <button className="text-[10px] font-bold tracking-widest text-zinc-400 underline underline-offset-4 font-body uppercase">SIZE GUIDE</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map(size => (
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

          {/* Action Button */}
          <div className="mt-16">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-primary text-on-primary h-20 font-headline font-black text-xl tracking-tighter uppercase flex items-center justify-center gap-4 hover:bg-primary-fixed transition-colors active:scale-[0.98] duration-200"
            >
              ADD TO COMMANDER
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Section (Brutalist Spacer) */}
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
