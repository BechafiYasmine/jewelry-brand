import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const money = (amount) => `${Number(amount).toLocaleString()} DZD`

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = useCallback(async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login', { replace: true })
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        navigate('/admin/login', { replace: true })
        return
      }
      if (!response.ok) throw new Error(data.message || 'Could not load orders.')
      setOrders(data.orders)
    } catch (err) {
      setError(err.message || 'Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  async function changeStatus(orderId, status) {
    const token = localStorage.getItem('adminToken')
    setUpdatingId(orderId)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        navigate('/admin/login', { replace: true })
        return
      }
      if (!response.ok) throw new Error(data.message || 'Could not update order.')
      setOrders((current) => current.map((order) => order.id === orderId ? data.order : order))
    } catch (err) {
      setError(err.message || 'Could not update order.')
    } finally {
      setUpdatingId(null)
    }
  }

  const pendingCount = orders.filter((order) => order.status === 'PENDING').length
  const totalRevenue = useMemo(
    () => orders.filter((order) => order.status !== 'CANCELLED').reduce((sum, order) => sum + order.total, 0),
    [orders],
  )

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-content">
        <p className="admin-dashboard-eyebrow">STORE MANAGEMENT</p>
        <div className="admin-section-toolbar">
          <div>
            <h2>Orders</h2>
            <p>Manage customer purchases and delivery progress.</p>
          </div>
          <button type="button" className="admin-action-button" onClick={loadOrders} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh orders'}
          </button>
        </div>
        {error && <p className="admin-dashboard-error" role="alert">{error}</p>}

        <div className="admin-dashboard-stats">
          <article><span>Total orders</span><strong>{orders.length}</strong></article>
          <article><span>Awaiting confirmation</span><strong>{pendingCount}</strong></article>
          <article><span>Order value, excluding cancellations</span><strong>{money(totalRevenue)}</strong></article>
        </div>

        <div className="admin-orders-heading">
          <h2>All orders</h2>
          <span>{orders.length} orders</span>
        </div>

        {loading ? <p>Loading orders…</p> : orders.length === 0 ? (
          <div className="admin-orders-empty">
            <h3>No orders yet</h3>
            <p>Orders submitted through checkout will appear here.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <article className="admin-order-card" key={order.id}>
                <div className="admin-order-top">
                  <div><strong>#{order.orderNumber}</strong><p>{new Date(order.createdAt).toLocaleString()}</p></div>
                  <strong>{money(order.total)}</strong>
                </div>
                <div className="admin-order-customer">
                  <p><strong>{order.customerName}</strong></p>
                  <p>{order.phone}</p>
                  <p>{order.commune}, {order.wilaya}</p>
                  <p>Delivery: {order.deliveryMethod === 'home' ? 'Home delivery' : 'Office delivery'}</p>
                  {order.notes && <p>Notes: {order.notes}</p>}
                </div>
                <div className="admin-order-items">
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>{money(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="admin-order-bottom">
                  <span>Subtotal: {money(order.subtotal)} · Delivery: {money(order.deliveryFee)}</span>
                  <label>
                    Status
                    <select value={order.status} disabled={updatingId === order.id} onChange={(event) => changeStatus(order.id, event.target.value)}>
                      {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
