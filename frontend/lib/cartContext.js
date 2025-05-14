import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial cart state
const initialCartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Cart actions
const CartActions = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CartActions.ADD_ITEM: {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let newItems;
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + (action.payload.quantity || 1),
            };
          }
          return item;
        });
      } else {
        // Add new item
        newItems = [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }

      // Calculate total and item count
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return { ...state, items: newItems, total, itemCount };
    }

    case CartActions.REMOVE_ITEM: {
      const newItems = state.items.filter((item) => item.id !== action.payload.id);
      
      // Calculate total and item count
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return { ...state, items: newItems, total, itemCount };
    }

    case CartActions.UPDATE_QUANTITY: {
      const newItems = state.items.map((item) => {
        if (item.id === action.payload.id) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });

      // Calculate total and item count
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return { ...state, items: newItems, total, itemCount };
    }

    case CartActions.CLEAR_CART:
      return initialCartState;

    default:
      return state;
  }
}

// Create the context
const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  // Load cart from localStorage if available
  const loadCartFromStorage = () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('depositshield_cart');
      return savedCart ? JSON.parse(savedCart) : initialCartState;
    }
    return initialCartState;
  };

  const [cart, dispatch] = useReducer(cartReducer, initialCartState, loadCartFromStorage);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('depositshield_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Cart actions
  const addItem = (item) => {
    dispatch({ type: CartActions.ADD_ITEM, payload: item });
  };

  const removeItem = (id) => {
    dispatch({ type: CartActions.REMOVE_ITEM, payload: { id } });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: CartActions.UPDATE_QUANTITY, payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CartActions.CLEAR_CART });
  };

  // Create value object
  const value = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}