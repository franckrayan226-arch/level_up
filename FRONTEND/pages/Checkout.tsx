import { useState, useRef } from 'react';
import { MapPin, Loader2, CreditCard, UploadCloud, Trash2, ArrowRight, ShoppingBag, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { getImageUrl, verifyAndDecrementStock } from '../api';

type PaymentMethod = 'orange' | 'moov' | 'wave';

interface PaymentInfo {
  method: PaymentMethod;
  name: string;
  ussdCode: string;
  deepLink: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const MERCHANT_PHONE = '63293139';

const PAYMENT_METHODS: Record<PaymentMethod, PaymentInfo> = {
  orange: {
    method: 'orange',
    name: 'Orange Money',
    ussdCode: '*144#',
    deepLink: 'tel:*144#',
    color: '#FF7900',
    borderColor: 'border-[#FF7900]',
    bgColor: 'bg-[#FF7900]/5'
  },
  moov: {
    method: 'moov',
    name: 'Moov Money',
    ussdCode: '*155#',
    deepLink: 'tel:*155#',
    color: '#0055A5',
    borderColor: 'border-[#0055A5]',
    bgColor: 'bg-[#0055A5]/5'
  },
  wave: {
    method: 'wave',
    name: 'Wave',
    ussdCode: '',
    deepLink: 'https://wave.com/send',
    color: '#1CBBFF',
    borderColor: 'border-[#1CBBFF]',
    bgColor: 'bg-[#1CBBFF]/5'
  }
};

export default function CheckoutWhatsApp() {
  const { cartItems, cartTotal, cartSubtotal, cartShipping, removeFromCart, updateQuantity } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La geolocalisation n\'est pas supportee par votre navigateur');
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
          if (!response.ok) throw new Error('Failed');
          const data = await response.json();
          setAddress(data.display_name || `${latitude}, ${longitude}`);
        } catch {
          setAddress(`${position.coords.latitude}, ${position.coords.longitude}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setLocationError(`Erreur: ${error.message}`);
        setIsLocating(false);
      }
    );
  };

  const initiatePayment = () => {
    const amount = cartTotal;

    if (paymentMethod === 'wave') {
      setPaymentInitiated(true);
      return;
    }

    let ussdCode = '';
    if (paymentMethod === 'orange') {
      ussdCode = `*144*10*${MERCHANT_PHONE}*${amount}#`;
    } else if (paymentMethod === 'moov') {
      ussdCode = `*555*2*1*${MERCHANT_PHONE}*${amount}#`;
    }

    window.location.href = `tel:${encodeURIComponent(ussdCode)}`;
    setPaymentInitiated(true);
  };

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('screenshot', file);

    try {
      const res = await fetch('/api/upload-payment', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshot(URL.createObjectURL(file));
    setScreenshotFile(file);
    setIsUploading(true);

    const url = await uploadScreenshot(file);
    if (url) {
      setUploadedImageUrl(url);
    }
    setIsUploading(false);
  };

  const removeFile = () => {
    if (screenshot) URL.revokeObjectURL(screenshot);
    setScreenshot(null);
    setScreenshotFile(null);
    setUploadedImageUrl(null);
  };

  const sendOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!screenshotFile) {
      alert('Veuillez joindre une preuve de paiement');
      return;
    }

    // VERIFIER LE STOCK AVANT COMMANDE
    const stockItems = cartItems.map(item => ({
      productId: item.productId,
      taille: item.size,
      couleur: item.color,
      quantity: item.quantity
    }));

    setIsSubmitting(true);

    const stockCheck = await verifyAndDecrementStock(stockItems);
    
    if (!stockCheck.success) {
      const failed = stockCheck.items.filter((i: any) => !i.ok);
      alert(`Stock insuffisant:\n${failed.map((f: any) => `- ${f.taille}/${f.couleur}: ${f.raison}`).join('\n')}`);
      setIsSubmitting(false);
      return;
    }

    let imageUrl = uploadedImageUrl;
    if (!imageUrl && screenshotFile) {
      imageUrl = await uploadScreenshot(screenshotFile);
      if (imageUrl) setUploadedImageUrl(imageUrl);
    }

    const method = PAYMENT_METHODS[paymentMethod];

    let message = `NOUVELLE COMMANDE - MONOLITH\n\n`;
    message += `Client: ${fullName}\n`;
    message += `Telephone: ${phone}\n`;
    message += `Adresse: ${address}\n`;
    if (coordinates) {
      message += `GPS: https://maps.google.com/?q=${coordinates.lat},${coordinates.lon}\n`;
    }
    message += `\nProduits:\n`;

    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${item.size}, ${item.color}) = ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA\n`;
    });

    message += `\nSous-total: ${cartSubtotal.toLocaleString('fr-FR')} FCFA\n`;
    message += `Livraison: ${cartShipping.toLocaleString('fr-FR')} FCFA\n`;
    message += `Total: ${cartTotal.toLocaleString('fr-FR')} FCFA\n`;
    message += `Paiement: ${method.name}\n`;

    if (imageUrl) {
      message += `\nPreuve de paiement: ${window.location.origin}${imageUrl}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/22663293139?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="pt-28 pb-32 px-6 max-w-5xl mx-auto text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-zinc-300 mb-6" />
        <h1 className="font-headline font-black text-2xl tracking-tighter uppercase mb-4">VOTRE PANIER EST VIDE</h1>
        <Link to="/shop" className="text-primary font-bold tracking-widest uppercase text-sm border-b border-primary pb-1">
          CONTINUER LES ACHATS
        </Link>
      </div>
    );
  }

  const currentMethod = PAYMENT_METHODS[paymentMethod];

  return (
    <div className="pt-28 pb-32 px-6 max-w-5xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] font-headline mb-12">CHECKOUT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-7 space-y-12">

          <section>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase mb-8 flex items-center gap-2 font-headline">
              <MapPin className="w-5 h-5" />
              Informations de livraison
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2 font-body">Nom complet *</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VOTRE NOM COMPLET"
                  className="w-full bg-transparent border-0 border-b border-zinc-200 focus:border-primary focus:ring-0 p-0 pb-2 text-sm placeholder:text-zinc-300 font-medium font-body uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2 font-body">Telephone *</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+22663 29 31 39"
                  className="w-full bg-transparent border-0 border-b border-zinc-200 focus:border-primary focus:ring-0 p-0 pb-2 text-sm placeholder:text-zinc-300 font-medium font-body"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-500 font-body">Adresse de livraison *</label>
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-primary hover:text-primary-fixed transition-colors disabled:opacity-50"
                  >
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    {isLocating ? 'Localisation...' : 'Utiliser ma position'}
                  </button>
                </div>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VOTRE ADRESSE OU UTILISEZ LE BOUTON GPS"
                  rows={3}
                  className="w-full bg-transparent border-0 border-b border-zinc-200 focus:border-primary focus:ring-0 p-0 pb-2 text-sm placeholder:text-zinc-300 font-medium resize-none font-body"
                  required
                />
                {locationError && (
                  <p className="text-[10px] text-red-500 mt-2 font-body">{locationError}</p>
                )}
                {coordinates && (
                  <p className="text-[10px] text-green-600 mt-2 font-body">
                     Position GPS recuperee
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase mb-6 flex items-center gap-2 font-headline">
              <CreditCard className="w-5 h-5" />
              Paiement
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('orange'); setPaymentInitiated(false); }}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'orange' ? 'border-[#FF7900] bg-[#FF7900]/5' : 'border-zinc-200 hover:border-[#FF7900]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#FF7900]">Orange Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('moov'); setPaymentInitiated(false); }}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'moov' ? 'border-[#0055A5] bg-[#0055A5]/5' : 'border-zinc-200 hover:border-[#0055A5]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#0055A5]">Moov Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('wave'); setPaymentInitiated(false); }}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'wave' ? 'border-[#1CBBFF] bg-[#1CBBFF]/5' : 'border-zinc-200 hover:border-[#1CBBFF]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#1CBBFF]">Wave</span>
                </button>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase mb-2 font-headline">1. Effectuez le paiement</h3>
                  <p className="text-xs text-zinc-500 font-body mb-4">
                    Montant a payer: <strong className="text-primary" style={{ color: currentMethod.color }}>{cartTotal.toLocaleString('fr-FR')} FCFA</strong>
                    <span className="block text-[10px] text-zinc-400 mt-1">(produits + livraison 1000 FCFA)</span>
                  </p>

                  {paymentMethod === 'wave' ? (
                    <div className="border border-[#1CBBFF]/30 bg-[#1CBBFF]/5 p-4 text-center">
                      <p className="text-sm font-bold text-[#1CBBFF] mb-2">Wave</p>
                      <p className="text-xs text-zinc-600 mb-1">Envoyez {cartTotal.toLocaleString('fr-FR')} FCFA au numero:</p>
                      <p className="text-2xl font-black tracking-tighter font-headline text-black">+226 63 29 31 39</p>
                      <p className="text-[10px] text-zinc-400 mt-2">Ouvrez l'app Wave et cherchez ce numero</p>
                    </div>
                  ) : (
                    <button
                      onClick={initiatePayment}
                      className="w-full py-4 px-6 font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:opacity-90 text-white"
                      style={{ backgroundColor: currentMethod.color }}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>COMPOSER {currentMethod.ussdCode}</span>
                    </button>
                  )}

                  {paymentInitiated && paymentMethod !== 'wave' && (
                    <p className="text-[10px] text-green-600 mt-2 font-body text-center">
                       Paiement lance sur votre telephone
                    </p>
                  )}

                  <p className="text-[10px] text-zinc-400 mt-3 font-body text-center">
                    {paymentMethod === 'wave' 
                      ? 'Ouvrez l\'application Wave sur votre telephone pour completer le paiement' 
                      : 'Le code USSD va s\'ouvrir sur votre telephone. Suivez les instructions.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase mb-4 font-headline">2. Preuve de paiement *</h3>

                  {!screenshot ? (
                    <div 
                      className="relative border-2 border-dashed border-zinc-300 hover:border-primary/60 transition-colors bg-white p-6 flex flex-col items-center justify-center text-center cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest font-headline">Cliquez pour importer</p>
                      <p className="text-[10px] text-zinc-400 font-body mt-1">Capture d'ecran du recu</p>
                    </div>
                  ) : (
                    <div className="relative border border-primary/30 bg-white p-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-zinc-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={screenshot} alt="Recu" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium font-body truncate">Capture d'ecran</span>
                          {isUploading && <span className="text-[10px] text-primary">Upload en cours...</span>}
                          {uploadedImageUrl && <span className="text-[10px] text-green-600"> Uploade</span>}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={removeFile}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <button 
            onClick={sendOrder}
            disabled={isSubmitting || isUploading || !uploadedImageUrl}
            className="w-full bg-primary text-white py-6 px-10 font-bold tracking-widest uppercase flex justify-between items-center group transition-all duration-300 hover:bg-black font-headline disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Envoi...' : 'COMMANDER PAR WHATSAPP'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32 space-y-8">
            <h2 className="text-xl font-extrabold tracking-tighter uppercase flex items-center gap-2 font-headline">
              <ShoppingBag className="w-5 h-5" />
              Recapitulatif
            </h2>

            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-zinc-50 p-4 flex gap-4">
                  <div className="w-20 aspect-[3/4] bg-white shrink-0">
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-bold text-xs tracking-tight uppercase font-headline">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 tracking-widest uppercase mt-1 font-body">{item.color} / {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-zinc-200 px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-zinc-400 hover:text-black">-</button>
                        <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-zinc-400 hover:text-black">+</button>
                      </div>
                      <span className="text-sm font-black tracking-tighter uppercase font-headline">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase font-body">Sous-total</span>
                <span className="text-sm font-bold tracking-tight font-headline">{cartSubtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase font-body">Livraison</span>
                <span className="text-sm font-bold tracking-tight font-headline">{cartShipping.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                <span className="text-xs font-black tracking-widest uppercase font-headline">Total</span>
                <span className="text-2xl font-black tracking-tighter uppercase font-headline">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}