import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'lunea-cart'

function getSavedCart() {
  try {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsedCart = savedCart ? JSON.parse(savedCart) : []
    return Array.isArray(parsedCart) ? parsedCart : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(getSavedCart)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, quantity = 1, color = 'Gold') => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id && (item.color ?? 'Gold') === color,
      )

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id && (item.color ?? 'Gold') === color
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [...currentCart, { ...product, color, quantity }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (productId, color = 'Gold') => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId || (item.color ?? 'Gold') !== color),
    )
  }

  const increaseQuantity = (productId, color = 'Gold') => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId && (item.color ?? 'Gold') === color
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  const decreaseQuantity = (productId, color = 'Gold') => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId && (item.color ?? 'Gold') === color
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const clearCart = () => setCart([])
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}
