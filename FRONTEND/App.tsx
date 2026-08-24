import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CheckoutWhatsApp from './pages/Checkout';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import { CartProvider } from './context/CartContext';
import { trackVisite } from './analytics';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '') trackVisite('accueil');
    else if (path.startsWith('/shop')) trackVisite('boutique');
    else if (path.startsWith('/product/')) trackVisite('produit', path.split('/')[2]);
    else if (path.startsWith('/checkout')) trackVisite('commande');
    else if (path.startsWith('/profile')) trackVisite('profil');
    else trackVisite('autre');
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="checkout" element={<CheckoutWhatsApp />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}