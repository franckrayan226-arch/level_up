import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
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
  cartTotal: number;
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
      
      // If an item with the new size already exists, merge them
      const existingNewSizeItem = prev.find(i => i.id === newId);
      
      if (existingNewSizeItem) {
        return prev
          .filter(i => i.id !== id) // remove old item
          .map(i => i.id === newId ? { ...i, quantity: i.quantity + itemToUpdate.quantity } : i);
      }

      // Otherwise just update the size and id of the current item
      return prev.map(i => i.id === id ? { ...i, id: newId, size: newSize } : i);
    });
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      updateSize,
      cartTotal,
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
