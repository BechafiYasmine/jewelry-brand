import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ORDER_STORAGE_KEY = 'lunea-last-order'

function Checkout() {
  const { cart, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const delivery = cartTotal >= 6500 ? 0 : 500
  const [formError, setFormError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    deliveryMethod: 'home',
    wilaya: '',
    commune: '',
    notes: '',
  })

  if (cart.length === 0 && !orderPlaced) {
    return <Navigate to="/shop" replace />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setFormError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.fullName,
          phone: form.phone,
          deliveryMethod: form.deliveryMethod,
          wilaya: form.wilaya,
          commune: form.commune,
          notes: form.notes,
          items: cart.map((item) => ({
            productId: Number(item.id),
            quantity: Number(item.quantity),
          })),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'Unable to place your order.')
      }

      const savedOrder = data.order
      const confirmationOrder = {
        ...form,
        id: savedOrder.orderNumber,
        items: cart,
        subtotal: savedOrder.subtotal,
        delivery: savedOrder.deliveryFee,
        total: savedOrder.total,
        paymentMethod: 'Cash on Delivery',
        createdAt: savedOrder.createdAt,
      }

      try {
        window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(confirmationOrder))
      } catch {
        // The order is safely stored in the database; confirmation can still be shown.
      }

      setOrderPlaced(true)
      clearCart()
      navigate('/order-confirmation', { state: { order: confirmationOrder } })
    } catch (error) {
      setFormError(error.message || 'Unable to place your order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="checkout-page">
      <header className="checkout-heading">
        <span className="section-eyebrow">LUNÉA · SECURE CHECKOUT</span>
        <h1>Complete your order</h1>
        <p>Your pieces are almost on their way.</p>
      </header>

      <form className="checkout-layout" onSubmit={placeOrder}>
        <div className="checkout-form-panel">
          <section className="checkout-form-section">
            <span className="checkout-step">01</span>
            <div className="checkout-section-body">
              <h2>Contact information</h2>
              <label className="checkout-field">
                <span>Full name</span>
                <input
                  autoComplete="name"
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField}
                  required
                  maxLength={100}
                />
              </label>
              <label className="checkout-field">
                <span>Phone number</span>
                <input
                  autoComplete="tel"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  required
                  minLength={7}
                  maxLength={24}
                />
              </label>
            </div>
          </section>

          <section className="checkout-form-section">
            <span className="checkout-step">02</span>
            <div className="checkout-section-body">
              <h2>Delivery method</h2>
              <div className="delivery-options">
                <label className="delivery-option">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="home"
                    checked={form.deliveryMethod === 'home'}
                    onChange={updateField}
                  />
                  <span><strong>Home delivery</strong><small>Delivered to your address</small></span>
                </label>
                <label className="delivery-option">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="office"
                    checked={form.deliveryMethod === 'office'}
                    onChange={updateField}
                  />
                  <span><strong>Office delivery</strong><small>Collect from a delivery office</small></span>
                </label>
              </div>
              <div className="checkout-address-grid">
                <label className="checkout-field">
                  <span>Wilaya</span>
                  <input name="wilaya" value={form.wilaya} onChange={updateField} required maxLength={80} />
                </label>
                <label className="checkout-field">
                  <span>Commune</span>
                  <input name="commune" value={form.commune} onChange={updateField} required maxLength={80} />
                </label>
              </div>
              <label className="checkout-field">
                <span>Order notes <small>(optional)</small></span>
                <textarea name="notes" value={form.notes} onChange={updateField} rows="3" maxLength={500} />
              </label>
            </div>
          </section>

          <section className="checkout-form-section">
            <span className="checkout-step">03</span>
            <div className="checkout-section-body">
              <h2>Payment</h2>
              <div className="payment-method">
                <span className="payment-radio" aria-hidden="true" />
                <span><strong>Cash on Delivery</strong><small>Pay when your order arrives</small></span>
              </div>
            </div>
          </section>
          {formError && <p className="checkout-error" role="alert">{formError}</p>}
        </div>

        <aside className="checkout-order-summary">
          <h2>Your order</h2>
          <div className="checkout-order-items">
            {cart.map((item) => (
              <div className="checkout-order-item" key={`${item.id}-${item.color ?? 'Gold'}`}>
                <div className="checkout-order-image">
                  <img src={item.image} alt="" />
                  <span>{item.quantity}</span>
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.category}{item.color ? ` · ${item.color}` : ''}</small>
                </div>
                <span>{(item.price * item.quantity).toLocaleString()} DZD</span>
              </div>
            ))}
          </div>
          <div className="checkout-price-row"><span>Subtotal</span><strong>{cartTotal.toLocaleString()} DZD</strong></div>
          <div className="checkout-price-row"><span>Delivery</span><strong>{delivery ? `${delivery.toLocaleString()} DZD` : 'FREE'}</strong></div>
          <div className="checkout-total-row"><span>Total</span><strong>{(cartTotal + delivery).toLocaleString()} DZD</strong></div>
          <button className="checkout-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting order…' : 'Place order · Cash on Delivery'}
          </button>
          <p className="checkout-privacy">Your order details are securely submitted to our store when you place your order.</p>
          <Link className="checkout-back-link" to="/shop">Continue shopping</Link>
        </aside>
      </form>
    </main>
  )
}

export function OrderConfirmation() {
  const location = useLocation()
  const [order] = useState(() => {
    if (location.state?.order) return location.state.order

    try {
      const savedOrder = window.localStorage.getItem(ORDER_STORAGE_KEY)
      return savedOrder ? JSON.parse(savedOrder) : null
    } catch {
      return null
    }
  })

  if (!order) {
    return (
      <main className="order-confirmation">
        <span className="confirmation-mark">♡</span>
        <span className="section-eyebrow">LUNÉA</span>
        <h1>No recent order found</h1>
        <Link to="/shop" className="button button-dark">Explore the collection</Link>
      </main>
    )
  }

  return (
    <main className="order-confirmation">
      <span className="confirmation-mark" aria-hidden="true">✓</span>
      <span className="section-eyebrow">ORDER CONFIRMED</span>
      <h1>Thank you, {order.fullName.split(' ')[0]}.</h1>
      <p>Your order has been received. We will contact you shortly to confirm the details.</p>
      <div className="confirmation-order-number">Order <strong>#{order.id}</strong></div>
      <div className="confirmation-detail"><span>Payment</span><strong>{order.paymentMethod}</strong></div>
      <div className="confirmation-detail"><span>Delivery to</span><strong>{order.commune}, {order.wilaya}</strong></div>
      <div className="confirmation-detail"><span>Total</span><strong>{order.total.toLocaleString()} DZD</strong></div>
      <Link to="/" className="button button-dark">Back to Lunéa</Link>
    </main>
  )
}

export default Checkout
