import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  livraison: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSize: (id: string, newSize: string) => void;
  updateColor: (id: string, newColor: string) => void;
  cartTotal: number;
  cartSubtotal: number;
  cartShipping: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const id = `${item.productId}-${item.size}-${item.color}`;
    setCartItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id }];
    });
    openCart();
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const updateSize = (id: string, newSize: string) => {
    setCartItems(prev => {
      const itemToUpdate = prev.find(i => i.id === id);
      if (!itemToUpdate) return prev;

      const newId = `${itemToUpdate.productId}-${newSize}-${itemToUpdate.color}`;
      const existingNewSizeItem = prev.find(i => i.id === newId);

      if (existingNewSizeItem) {
        return prev
          .filter(i => i.id !== id)
          .map(i => i.id === newId ? { ...i, quantity: i.quantity + itemToUpdate.quantity } : i);
      }

      return prev.map(i => i.id === id ? { ...i, id: newId, size: newSize } : i);
    });
  };

  const updateColor = (id: string, newColor: string) => {
    setCartItems(prev => {
      const itemToUpdate = prev.find(i => i.id === id);
      if (!itemToUpdate) return prev;

      const newId = `${itemToUpdate.productId}-${itemToUpdate.size}-${newColor}`;
      const existingNewColorItem = prev.find(i => i.id === newId);

      if (existingNewColorItem) {
        return prev
          .filter(i => i.id !== id)
          .map(i => i.id === newId ? { ...i, quantity: i.quantity + itemToUpdate.quantity } : i);
      }

      return prev.map(i => i.id === id ? { ...i, id: newId, color: newColor } : i);
    });
  };

  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartShipping = cartItems.length > 0 ? 1000 : 0;
  const cartTotal = cartSubtotal + cartShipping;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      updateSize,
      updateColor,
      cartTotal,
      cartSubtotal,
      cartShipping,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
