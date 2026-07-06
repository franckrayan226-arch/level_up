import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="pt-28 pb-32 px-6 max-w-3xl mx-auto">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-headline mb-4">PRIVACY POLICY</h1>
        <p className="text-xs text-zinc-500 tracking-widest uppercase font-body">Last updated: April 2026</p>
      </div>
      
      <div className="space-y-12 font-body text-sm leading-relaxed text-zinc-800">
        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">1. Data Collection</h2>
          <p>
            At Rente Meme, we collect essential information required to process your orders and improve your shopping experience. This includes your name, phone number, and delivery address, which are provided by you during the checkout process.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">2. Use of Information</h2>
          <p>
            The information we collect is primarily used to fulfill your orders and arrange delivery. Additionally, by providing your contact details, you consent to us using your phone number to send you promotional updates, newsletters, and exclusive offers via WhatsApp or SMS. You may opt out of these promotional messages at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">3. Data Protection</h2>
          <p>
            We respect your privacy and are committed to protecting your personal data. Your information is kept secure and is only accessible to authorized Rente Meme staff for the purposes outlined above. We do not sell, trade, or rent your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight uppercase font-headline mb-4">4. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding our privacy practices, or if you wish to update or remove your personal information from our records, please contact us via WhatsApp at: <strong>+226 63 29 31 39</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
