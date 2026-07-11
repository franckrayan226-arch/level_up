import { X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    closeCart, 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    updateSize,
    cartTotal,
    cartSubtotal,
    cartShipping
  } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const hasUnavailableItems = cartItems.some(item => {
    const product = products.find(p => p.id === item.productId);
    return product?.disponible === false || 
      (product?.disponibilite && product.disponibilite.find(d => d.taille === item.size && d.couleur === item.color)?.disponible === false);
  });

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed top-0 right-0 h-[100dvh] w-full md:w-[450px] bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="h-20 px-6 flex items-center justify-between border-b border-outline-variant/10 shrink-0">
          <h2 className="font-headline font-black text-2xl tracking-tighter uppercase">CART ({cartItems.reduce((a, b) => a + b.quantity, 0)})</h2>
          <button onClick={closeCart} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400">
              <p className="font-headline font-bold text-sm tracking-widest uppercase mb-4">Your cart is empty</p>
              <button 
                onClick={closeCart}
                className="font-body text-xs font-bold tracking-widest uppercase text-primary border-b border-primary pb-1"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            cartItems.map(item => {
              const product = products.find(p => p.id === item.productId);
              const isAvailable = product?.disponible !== false && 
                (!product?.disponibilite || product.disponibilite.find(d => d.taille === item.size && d.couleur === item.color)?.disponible !== false);

              return (
                <div key={item.id} className={`flex gap-4 bg-surface-container-lowest p-4 relative group ${!isAvailable ? 'opacity-60 border border-red-200' : ''}`}>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="absolute top-2 right-2 text-zinc-300 hover:text-error transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="w-20 aspect-[3/4] bg-surface-container-low shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex flex-col justify-between flex-1">
                    <div className="pr-6">
                      <h4 className="font-bold text-xs tracking-tight uppercase font-headline line-clamp-2">{item.name}</h4>
                      <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mt-1 font-body">{item.color}</p>
                      {!isAvailable && (
                        <p className="text-[9px] text-red-500 font-bold tracking-wider uppercase mt-1">INDISPONIBLE</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase font-body mb-1">SIZE</span>
                        {product ? (
                          <select 
                            value={item.size}
                            onChange={(e) => updateSize(item.id, e.target.value)}
                            className="text-[10px] font-bold tracking-widest uppercase text-black font-body bg-transparent border-b border-zinc-200 focus:outline-none focus:border-black pb-1 cursor-pointer"
                          >
                            {product.sizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] font-bold tracking-widest uppercase text-black font-body">{item.size}</span>
                        )}
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase font-body mb-1">QTY</span>
                        <div className="flex items-center gap-3 border border-zinc-200 px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-zinc-400 hover:text-black transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-black font-body w-4 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-zinc-400 hover:text-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-black tracking-tighter uppercase font-headline mt-3 whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest shrink-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Sous-total</span>
                <span className="text-sm font-bold">{cartSubtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Livraison</span>
                <span className="text-sm font-bold text-zinc-400">{cartShipping.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                <span className="text-xs font-black tracking-widest uppercase">Total</span>
                <span className="text-xl font-black tracking-tighter">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={hasUnavailableItems}
              className="w-full bg-primary text-on-primary py-5 px-6 font-bold tracking-widest uppercase flex justify-between items-center group transition-all duration-300 hover:bg-primary-fixed font-headline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>CHECKOUT</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            {hasUnavailableItems && (
              <p className="text-[10px] text-red-500 text-center mt-2 font-body font-bold tracking-widest uppercase">
                Des articles sont indisponibles
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}