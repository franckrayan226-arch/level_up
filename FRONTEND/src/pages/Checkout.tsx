import { useState } from 'react';
import { ArrowRight, Info, ShoppingBag, User, X, Plus, Minus, MapPin, Loader2, CreditCard, UploadCloud, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { products } from '../data/products';

export default function Checkout() {
  const { cartItems, removeFromCart, updateQuantity, updateSize, cartTotal } = useCart();
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'orange' | 'moov' | 'wave'>('whatsapp');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotUrl(URL.createObjectURL(file));
      setScreenshotName(file.name);
    }
  };

  const removeFile = () => {
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setScreenshotUrl(null);
    setScreenshotName(null);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error('Failed to get address');
          const data = await response.json();
          setAddress(data.display_name || `${latitude}, ${longitude}`);
        } catch (error) {
          setLocationError('Could not fetch address details. Using coordinates instead.');
          setAddress(`${position.coords.latitude}, ${position.coords.longitude}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="pt-28 pb-32 px-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] font-headline">CHECKOUT</h1>
        <p className="text-on-surface-variant font-medium tracking-widest text-[10px] mt-4 uppercase font-body">Direct Order Confirmation via Administrator</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-12">
          <section>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase mb-8 flex items-center gap-2 font-headline">
              <User className="w-5 h-5" />
              Delivery Information
            </h2>
            <form className="space-y-10">
              {/* Name Field */}
              <div className="relative">
                <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 font-body">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ALEXANDER VOGUE" 
                  className="w-full bg-transparent border-0 border-b border-outline-variant/20 focus:border-primary focus:ring-0 p-0 pb-2 text-sm placeholder:text-zinc-300 font-medium font-body"
                />
              </div>
              {/* Phone Field */}
              <div className="relative">
                <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-2 font-body">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 00 00 00 00" 
                  className="w-full bg-transparent border-0 border-b border-outline-variant/20 focus:border-primary focus:ring-0 p-0 pb-2 text-sm placeholder:text-zinc-300 font-medium font-body"
                  required
                />
              </div>
              {/* Address Field */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-on-surface-variant font-body">Delivery Address / Location</label>
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-primary hover:text-primary-fixed transition-colors disabled:opacity-50"
                  >
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    {isLocating ? 'Locating...' : 'Use Current Location'}
                  </button>
                </div>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="STREET, BUILDING, CITY, POSTAL CODE" 
                  rows={3}
                  className="w-full bg-transparent border-0 border-b border-outline-variant/20 focus:border-primary focus:ring-0 p-0 pb-2 text-sm placeholder:text-zinc-300 font-medium resize-none font-body"
                ></textarea>
                {locationError && (
                  <p className="text-[10px] text-error mt-2 font-body font-medium">{locationError}</p>
                )}
              </div>
            </form>
          </section>

          {/* Payment Method Section */}
          <section>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase mb-6 flex items-center gap-2 font-headline">
              <CreditCard className="w-5 h-5" />
              Paiement
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'whatsapp' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center">À la livraison</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange')}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'orange' ? 'border-[#FF7900] bg-[#FF7900]/5' : 'border-outline-variant/30 hover:border-[#FF7900]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#FF7900]">Orange Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('moov')}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'moov' ? 'border-[#0055A5] bg-[#0055A5]/5' : 'border-outline-variant/30 hover:border-[#0055A5]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#0055A5]">Moov Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'wave' ? 'border-[#1CBBFF] bg-[#1CBBFF]/5' : 'border-outline-variant/30 hover:border-[#1CBBFF]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#1CBBFF]">Wave</span>
                </button>
              </div>

              {/* Mobile Money Details */}
              {paymentMethod !== 'whatsapp' && (
                <div className="bg-surface-container-lowest border border-outline-variant/20 p-6 space-y-6 mt-4">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight uppercase mb-2 font-headline">1. Effectuez le transfert</h3>
                    <p className="text-xs text-on-surface-variant font-body">
                      Envoyez <strong className="text-primary">{cartTotal.toLocaleString('fr-FR')} FCFA</strong> au numéro suivant :
                    </p>
                    <div className="mt-3 text-lg font-black tracking-tighter bg-surface-container-low p-4 text-center">
                      {paymentMethod === 'orange' && '+226 00 00 00 00 (Orange)'}
                      {paymentMethod === 'moov' && '+226 00 00 00 00 (Moov)'}
                      {paymentMethod === 'wave' && '+226 00 00 00 00 (Wave)'}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold tracking-tight uppercase mb-4 font-headline">2. Preuve de paiement</h3>
                    
                    <div className="bg-primary/5 border border-primary/20 p-4 mb-5">
                      <p className="text-xs text-on-surface-variant font-body mb-4">
                        Veuillez importer <strong>la capture d'écran de votre reçu</strong> confirmant le transfert de <strong className="text-primary">{cartTotal.toLocaleString('fr-FR')} FCFA</strong>.
                      </p>
                      
                      {!screenshotUrl ? (
                        <div className="relative border-2 border-dashed border-outline-variant/40 hover:border-primary/60 transition-colors bg-surface-container-lowest p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-colors mb-2" />
                          <p className="text-xs font-bold uppercase tracking-widest font-headline">Cliquez pour importer</p>
                          <p className="text-[10px] text-on-surface-variant font-body mt-1">PNG, JPG ou JPEG</p>
                        </div>
                      ) : (
                        <div className="relative border border-primary/30 bg-surface-container-lowest p-2 flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-surface-container-highest flex-shrink-0 flex items-center justify-center overflow-hidden">
                              <img src={screenshotUrl} alt="Reçu" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs font-medium font-body truncate">{screenshotName}</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={removeFile}
                            className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Order Confirmation Note */}
          <div className="bg-surface-container-low p-8 flex gap-6 items-start">
            <Info className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-bold text-[10px] tracking-widest uppercase mb-2 font-headline">Processus de Commande</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">Votre commande sera envoyée sur WhatsApp à notre équipe. Nous validerons {paymentMethod !== 'whatsapp' ? 'votre paiement et ' : ''}les détails de livraison pour finaliser l'expédition.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <button 
              type="button"
              onClick={() => {
                let locationDetails = address || 'Non specifié';
                if (coordinates) {
                  locationDetails += `\nGoogle Maps: https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lon}`;
                }
                
                let paymentDetails = `Paiement à la livraison`;
                if (paymentMethod !== 'whatsapp') {
                  paymentDetails = `Paiement: ${paymentMethod.toUpperCase()}\nStatut: Capture d'écran enregistrée sur le site.\n[!] NOUBLIEZ PAS D'AJOUTER MANUELLEMENT VOTRE CAPTURE D'ÉCRAN DANS CE CHAT.`;
                }

                const message = `Bonjour, je souhaite commander :\n\n${cartItems.map(item => `- ${item.quantity}x ${item.name} (${item.size}, ${item.color}) - ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`).join('\n')}\n\nDétails de livraison :\nNom: ${name || 'Non specifié'}\nTéléphone: ${phone || 'Non specifié'}\nAdresse:\n${locationDetails}\n\n${paymentDetails}\n\nTotal: ${cartTotal.toLocaleString('fr-FR')} FCFA`;
                window.open(`https://wa.me/22663293139?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="w-full bg-primary text-on-primary py-6 px-10 font-bold tracking-widest uppercase flex justify-between items-center group transition-all duration-300 hover:bg-primary-fixed font-headline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0 || !phone.trim() || (paymentMethod !== 'whatsapp' && !screenshotUrl)}
            >
              <span>COMMANDER SUR WHATSAPP</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-center text-[9px] text-zinc-400 mt-4 tracking-widest uppercase font-body">Fast response within 15 minutes during business hours</p>
          </div>
        </div>

        {/* Right Column: Summary (Sticky) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32 space-y-8">
            <h2 className="text-xl font-extrabold tracking-tighter uppercase flex items-center gap-2 font-headline">
              <ShoppingBag className="w-5 h-5" />
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="bg-surface-container-lowest p-6 flex flex-col items-center justify-center text-center shadow-[0_10px_40px_rgba(0,0,0,0.04)] py-12">
                  <ShoppingBag className="w-12 h-12 text-zinc-300 mb-4" />
                  <p className="font-headline font-bold text-sm tracking-widest uppercase text-zinc-500 mb-4">Your cart is empty</p>
                  <Link to="/shop" className="font-body text-xs font-bold tracking-widest uppercase text-primary border-b border-primary pb-1">
                    CONTINUE SHOPPING
                  </Link>
                </div>
              ) : (
                cartItems.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  
                  return (
                    <div key={item.id} className="bg-surface-container-lowest p-6 flex gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] relative group">
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="absolute top-4 right-4 text-zinc-300 hover:text-error transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="w-24 aspect-[3/4] bg-surface-container-low overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-1 w-full">
                        <div className="pr-6">
                          <h4 className="font-bold text-sm tracking-tight uppercase font-headline line-clamp-2">{item.name}</h4>
                          <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mt-1 font-body">{item.color}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          {/* Size Selector */}
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

                          {/* Quantity Selector */}
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase font-body mb-1">QTY</span>
                            <div className="flex items-center gap-3 border border-zinc-200 px-2 py-1">
                              <button 
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="text-zinc-400 hover:text-black transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[10px] font-bold tracking-widest uppercase text-black font-body w-4 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="text-zinc-400 hover:text-black transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-black tracking-tighter uppercase font-headline mt-2 whitespace-nowrap">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pricing Details */}
            {cartItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase font-body">Subtotal</span>
                  <span className="text-sm font-bold tracking-tight font-headline whitespace-nowrap">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase font-body">Delivery</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-body">Calculated later</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-primary/5 gap-4">
                  <span className="text-xs font-black tracking-widest uppercase font-headline">Total</span>
                  <span className="text-2xl font-black tracking-tighter uppercase font-headline whitespace-nowrap">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

