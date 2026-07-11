import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { BrandLogo } from './BrandLogo';

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cartItems, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200 h-20 grid grid-cols-2 md:grid-cols-3 items-center px-6 md:px-12 max-w-none">
        {/* Left Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={`font-headline font-bold text-[11px] tracking-[0.2em] uppercase transition-colors ${pathname === '/' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>HOME</Link>
          <Link to="/shop" className={`font-headline font-bold text-[11px] tracking-[0.2em] uppercase transition-colors ${pathname === '/shop' ? 'text-black' : 'text-zinc-400 hover:text-black'}`}>SHOP</Link>
          <span className="font-headline font-bold text-[11px] tracking-[0.2em] uppercase text-zinc-400 hover:text-black transition-colors cursor-pointer">EDITORIAL</span>
        </nav>

        {/* Center Logo */}
        <div className="flex justify-start md:justify-center">
          <Link to="/" className="font-logo font-black uppercase tracking-[-0.05em] text-3xl md:text-4xl text-black">
            <BrandLogo />
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-6 md:gap-8">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="RECHERCHER..."
              className="hidden md:block bg-transparent border-0 border-b border-zinc-200 focus:border-primary focus:ring-0 p-0 pb-1 text-[11px] font-bold tracking-widest uppercase placeholder:text-zinc-300 w-32 focus:w-48 transition-all duration-300 outline-none"
            />
            <button type="submit" className="flex items-center gap-2 font-headline font-bold text-[11px] tracking-[0.2em] uppercase text-zinc-500 hover:text-black transition-colors group">
              <Search className="w-5 h-5 md:w-4 md:h-4 text-black md:text-zinc-500 group-hover:text-black transition-colors" />
              <span className="hidden md:inline">SEARCH</span>
            </button>
          </form>
          <Link to="/profile" className={`hidden md:flex items-center gap-2 font-headline font-bold text-[11px] tracking-[0.2em] uppercase transition-colors ${pathname === '/profile' ? 'text-black' : 'text-zinc-500 hover:text-black'}`}>
            <User className="w-4 h-4" />
            <span>PROFILE</span>
          </Link>
          <button onClick={openCart} className="font-headline font-bold text-[11px] tracking-[0.2em] uppercase text-black hover:opacity-70 transition-opacity">
            CART {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full py-20 px-6 bg-zinc-100 flex flex-col items-start gap-12 mb-20 md:mb-0">
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-2">
            <h4 className="font-logo font-black text-5xl md:text-7xl tracking-[-0.05em] uppercase text-black">
              <BrandLogo />
            </h4>
            <p className="font-body text-xs text-zinc-500 tracking-widest uppercase mt-2">
              High-End Streetwear
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:flex md:gap-20 w-full mt-4">
            <div className="flex flex-col gap-4">
              <span className="font-label text-[10px] text-zinc-400 tracking-widest uppercase mb-2">Connect</span>
              <a href="https://wa.me/22663293139" target="_blank" rel="noopener noreferrer" className="font-body text-xs font-medium tracking-widest uppercase text-zinc-500 hover:text-black transition-colors">WHATSAPP</a>
              <a href="https://snapchat.com/t/e8maTaZ4" target="_blank" rel="noopener noreferrer" className="font-body text-xs font-medium tracking-widest uppercase text-zinc-500 hover:text-black transition-colors">SNAPCHAT</a>
              <a href="https://www.tiktok.com/@level.up.wear.226?_r=1&_t=ZS-95fuhBJR756" target="_blank" rel="noopener noreferrer" className="font-body text-xs font-medium tracking-widest uppercase text-zinc-500 hover:text-black transition-colors">TIKTOK</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-label text-[10px] text-zinc-400 tracking-widest uppercase mb-2">Legal</span>
              <Link to="/terms" className="font-body text-xs font-medium tracking-widest uppercase text-zinc-500 hover:text-black transition-colors">TERMS</Link>
              <Link to="/privacy" className="font-body text-xs font-medium tracking-widest uppercase text-zinc-500 hover:text-black transition-colors">PRIVACY</Link>
            </div>
          </div>
          <p className="font-body text-[10px] font-medium tracking-widest uppercase text-zinc-400 mt-10">
            © 2026 <BrandLogo className="align-baseline" />. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 h-20 bg-white/90 backdrop-blur-xl flex justify-around items-center px-4 pb-safe border-t border-zinc-200">
        <Link to="/" className={`flex flex-col items-center justify-center pt-2 hover:text-black transition-colors ${pathname === '/' ? 'text-black' : 'text-zinc-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="font-headline font-bold text-[10px] tracking-widest uppercase">HOME</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center justify-center pt-2 hover:text-black transition-colors ${pathname === '/shop' ? 'text-black' : 'text-zinc-400'}`}>
          <Search className="w-6 h-6 mb-1" />
          <span className="font-headline font-bold text-[10px] tracking-widest uppercase">SHOP</span>
        </Link>
        <button onClick={openCart} className={`flex flex-col items-center justify-center pt-2 hover:text-black transition-colors text-zinc-400`}>
          <div className="relative">
            <ShoppingBag className="w-6 h-6 mb-1" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-on-primary text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="font-headline font-bold text-[10px] tracking-widest uppercase">CART</span>
        </button>
        <Link to="/profile" className={`flex flex-col items-center justify-center pt-2 hover:text-black transition-colors ${pathname === '/profile' ? 'text-black' : 'text-zinc-400'}`}>
          <User className="w-6 h-6 mb-1" />
          <span className="font-headline font-bold text-[10px] tracking-widest uppercase">PROFILE</span>
        </Link>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}