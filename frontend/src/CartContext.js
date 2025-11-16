import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (fish) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === fish.id);
      return existing
        ? prev.map(item => item.id === fish.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...fish, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
