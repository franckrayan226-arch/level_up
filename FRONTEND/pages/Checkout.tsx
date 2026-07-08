import { useState } from 'react';
import { MapPin, Loader2, CreditCard, UploadCloud, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';

type PaymentMethod = 'orange' | 'moov' | 'wave';

interface PaymentInfo {
  method: PaymentMethod;
  number: string;
  instructions: string;
}

const PAYMENT_METHODS: Record<PaymentMethod, PaymentInfo> = {
  orange: {
    method: 'orange',
    number: '+22607636257',
    instructions: 'Transférez le montant via Orange Money au numéro ci-dessus. Prenez une capture d\'écran du reçu.'
  },
  moov: {
    method: 'moov',
    number: '+22663293139',
    instructions: 'Transférez le montant via Moov Money au numéro ci-dessus. Prenez une capture d\'écran du reçu.'
  },
  wave: {
    method: 'wave',
    number: '+22663293139',
    instructions: 'Transférez le montant via Wave au numéro ci-dessus. Prenez une capture d\'écran du reçu.'
  }
};

export default function CheckoutWhatsApp() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  
  // Formulaire client
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [useGPS, setUseGPS] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  
  // Paiement
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer la position GPS
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    setLocationError('');
    setUseGPS(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          
          // Essayer de récupérer l'adresse via OpenStreetMap
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
        setUseGPS(false);
      }
    );
  };

  // Upload screenshot
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(URL.createObjectURL(file));
      setScreenshotFile(file);
    }
  };

  const removeFile = () => {
    if (screenshot) URL.revokeObjectURL(screenshot);
    setScreenshot(null);
    setScreenshotFile(null);
  };

  // Envoyer la commande WhatsApp
  const sendOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    // Construire le message
    const paymentInfo = PAYMENT_METHODS[paymentMethod];
    
    let message = ` *NOUVELLE COMMANDE - MONOLITH*\n\n`;
    message += `*Client:* ${fullName}\n`;
    message += `*Téléphone:* ${phone}\n`;
    message += `*Adresse:* ${address}\n`;
    if (coordinates) {
      message += `*GPS:* https://maps.google.com/?q=${coordinates.lat},${coordinates.lon}\n`;
    }
    message += `\n*Produits:*\n`;
    
    cartItems.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${item.size}, ${item.color}) = ${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA\n`;
    });
    
    message += `\n*Total:* ${cartTotal.toLocaleString('fr-FR')} FCFA\n`;
    message += `*Paiement:* ${paymentMethod.toUpperCase()}\n`;
    
    if (screenshotFile) {
      message += `\n Preuve de paiement jointe (capture d'écran)`;
    } else {
      message += `\n En attente de la preuve de paiement`;
    }

    // Encoder le message pour WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/22663293139?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');

    // Si il y a une capture d'écran, on pourrait l'uploader vers un service cloud
    // et ajouter le lien dans le message, mais pour l'instant on ouvre WhatsApp
    // et le client envoie la capture manuellement dans la conversation

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

  return (
    <div className="pt-28 pb-32 px-6 max-w-5xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] font-headline mb-12">CHECKOUT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Left: Formulaire */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Informations client */}
          <section>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase mb-8 flex items-center gap-2 font-headline">
              <MapPin className="w-5 h-5" />
              Informations de livraison
            </h2>
            
            <div className="space-y-8">
              {/* Nom */}
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

              {/* Téléphone */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-2 font-body">Téléphone *</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+226 XX XX XX XX"
                  className="w-full bg-transparent border-0 border-b border-zinc-200 focus:border-primary focus:ring-0 p-0 pb-2 text-sm placeholder:text-zinc-300 font-medium font-body"
                  required
                />
              </div>

              {/* Adresse + GPS */}
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
                     Position GPS récupérée
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Paiement */}
          <section>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase mb-6 flex items-center gap-2 font-headline">
              <CreditCard className="w-5 h-5" />
              Paiement
            </h2>
            
            <div className="space-y-4">
              {/* Sélection méthode */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange')}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'orange' ? 'border-[#FF7900] bg-[#FF7900]/5' : 'border-zinc-200 hover:border-[#FF7900]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#FF7900]">Orange Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('moov')}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'moov' ? 'border-[#0055A5] bg-[#0055A5]/5' : 'border-zinc-200 hover:border-[#0055A5]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#0055A5]">Moov Money</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`border p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${paymentMethod === 'wave' ? 'border-[#1CBBFF] bg-[#1CBBFF]/5' : 'border-zinc-200 hover:border-[#1CBBFF]/50'}`}
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase font-body text-center text-[#1CBBFF]">Wave</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase mb-2 font-headline">1. Effectuez le transfert</h3>
                  <p className="text-xs text-zinc-500 font-body">
                    Envoyez <strong className="text-primary">{cartTotal.toLocaleString('fr-FR')} FCFA</strong> au numéro :
                  </p>
                  <div className="mt-3 text-lg font-black tracking-tighter bg-white p-4 text-center border border-zinc-200">
                    {PAYMENT_METHODS[paymentMethod].number}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase mb-4 font-headline">2. Preuve de paiement</h3>
                  
                  {!screenshot ? (
                    <div className="relative border-2 border-dashed border-zinc-300 hover:border-primary/60 transition-colors bg-white p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest font-headline">Cliquez pour importer</p>
                      <p className="text-[10px] text-zinc-400 font-body mt-1">PNG, JPG ou JPEG</p>
                    </div>
                  ) : (
                    <div className="relative border border-primary/30 bg-white p-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-zinc-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={screenshot} alt="Reçu" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-medium font-body truncate">Capture d'écran</span>
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

          {/* Bouton commander */}
          <button 
            onClick={sendOrder}
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-6 px-10 font-bold tracking-widest uppercase flex justify-between items-center group transition-all duration-300 hover:bg-black font-headline disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Envoi...' : 'COMMANDER PAR WHATSAPP'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Right: Récapitulatif */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32 space-y-8">
            <h2 className="text-xl font-extrabold tracking-tighter uppercase flex items-center gap-2 font-headline">
              <ShoppingBag className="w-5 h-5" />
              Récapitulatif
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

            <div className="space-y-4 pt-4 border-t border-zinc-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase font-body">Sous-total</span>
                <span className="text-sm font-bold tracking-tight font-headline">{cartTotal.toLocaleString('fr-FR')} FCFA</span>
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