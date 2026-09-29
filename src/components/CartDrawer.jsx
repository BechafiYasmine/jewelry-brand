import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartDrawer() {
  const {
    cart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart()

  const delivery = cartTotal >= 6500 ? 0 : 500
  const total = cartTotal + delivery

  useEffect(() => {
    if (!isCartOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsCartOpen(false)
    }

    document.body.classList.add('cart-is-open')
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.classList.remove('cart-is-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isCartOpen, setIsCartOpen])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.button
            type="button"
            className="cart-overlay"
            aria-label="Close shopping bag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
          />

          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="cart-header">
              <div>
                <span className="cart-eyebrow">LUNÉA</span>
                <h2 id="cart-title">Your bag <span>({cartCount})</span></h2>
              </div>
              <button
                type="button"
                className="cart-close"
                aria-label="Close shopping bag"
                onClick={() => setIsCartOpen(false)}
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon" aria-hidden="true">♡</div>
                <h3>Your bag is empty</h3>
                <p>Discover something beautiful for yourself.</p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="cart-shop-button"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={`${item.id}-${item.color ?? 'Gold'}`}>
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <div>
                            <h3>{item.name}</h3>
                            <span>{item.category}</span>
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                          <button
                            type="button"
                            className="remove-item"
                            aria-label={`Remove ${item.name} from bag`}
                            onClick={() => removeFromCart(item.id, item.color)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="quantity-control" aria-label={`Quantity of ${item.name}`}>
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() => decreaseQuantity(item.id, item.color)}
                            >−</button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() => increaseQuantity(item.id, item.color)}
                            >+</button>
                          </div>
                          <strong>{(item.price * item.quantity).toLocaleString()} DZD</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  {cartTotal < 6500 && (
                    <p className="delivery-message">
                      Add {(6500 - cartTotal).toLocaleString()} DZD more for free delivery.
                    </p>
                  )}
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <strong>{cartTotal.toLocaleString()} DZD</strong>
                  </div>
                  <div className="summary-row">
                    <span>Delivery</span>
                    <strong>{delivery === 0 ? 'FREE' : `${delivery.toLocaleString()} DZD`}</strong>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <strong>{total.toLocaleString()} DZD</strong>
                  </div>
                  <Link
                    to="/checkout"
                    className="checkout-button"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Proceed to checkout
                  </Link>
                  <button
                    type="button"
                    className="continue-shopping"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
