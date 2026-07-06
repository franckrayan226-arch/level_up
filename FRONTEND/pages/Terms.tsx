import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="pt-28 pb-32 px-6 max-w-3xl mx-auto">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-headline mb-4">TERMS OF SERVICE</h1>
        <p className="text-xs text-zinc-500 tracking-widest uppercase font-body">Last updated: April 2026</p>
      </div>
      
      <div className="space-y-12 font-body text-sm leading-relaxed text-zinc-800">
        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">1. Introduction</h2>
          <p>
            Welcome to Rente Meme. These Terms of Service govern your use of our website and services. Rente Meme is a business operating and based in Burkina Faso. By placing an order with us, you agree to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">2. Ordering Process</h2>
          <p>
            All orders are initiated through our website and finalized manually. Once you submit your cart, you will be redirected to WhatsApp to confirm your order details with our team. An order is only considered final once confirmed by our staff via WhatsApp.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">3. Payment & Pricing</h2>
          <p>
            We currently accept payments exclusively through <strong>Orange Money</strong> and <strong>Wave</strong>. Payment details and instructions will be provided during the WhatsApp confirmation process. Prices are subject to change without notice, but you will always be charged the price agreed upon during your order confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">4. Returns & Refunds</h2>
          <p>
            We want you to be satisfied with your purchase. <strong>Exchanges are permitted</strong> for items of the same value, provided the item is returned in its original, unworn condition. However, please note that <strong>we do not offer refunds</strong> under any circumstances. All sales are final once payment is processed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">5. Contact Information</h2>
          <p>
            For any questions regarding these terms, your order, or our products, please contact us exclusively via WhatsApp at: <strong>+226 63 29 31 39</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
