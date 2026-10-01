import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminDashboardStats, getAdminOrders } from '../services/adminService'
import '../styles/admin.css'

const EMPTY_STATS = { totalOrders: 0, pendingOrders: 0, confirmedOrders: 0, revenue: 0 }
const money = (amount) => `${Number(amount || 0).toLocaleString()} DZD`
const dateLabel = (value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const statusLabel = (status) => status === 'PROCESSING' ? 'Preparing' : `${status?.[0] || ''}${status?.slice(1).toLowerCase() || ''}`

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(EMPTY_STATS)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, ordersData] = await Promise.all([
        getAdminDashboardStats(),
        getAdminOrders({ take: 5 }),
      ])
      setStats(statsData.stats || EMPTY_STATS)
      setRecentOrders(ordersData.orders || [])
    } catch (err) {
      if (err.status === 401) {
        window.localStorage.removeItem('adminToken')
        navigate('/admin/login', { replace: true })
        return
      }
      setError(err.message || 'Could not load the dashboard.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-content">
        <p className="admin-dashboard-eyebrow">STORE MANAGEMENT</p>
        <div className="admin-section-toolbar">
          <div>
            <h2>Good day, Admin</h2>
            <p>A clear view of your orders and store performance.</p>
          </div>
          <button type="button" className="admin-action-button" onClick={loadDashboard} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && <p className="admin-dashboard-error" role="alert">{error}</p>}

        <div className="admin-dashboard-stats admin-dashboard-stats-four">
          <article><span>Total orders</span><strong>{loading ? '—' : stats.totalOrders}</strong></article>
          <article><span>Pending orders</span><strong>{loading ? '—' : stats.pendingOrders}</strong></article>
          <article><span>Confirmed orders</span><strong>{loading ? '—' : stats.confirmedOrders}</strong></article>
          <article><span>Revenue · excludes cancelled</span><strong>{loading ? '—' : money(stats.revenue)}</strong></article>
        </div>

        <div className="admin-orders-heading">
          <div><h2>Recent orders</h2><span>Latest customer purchases</span></div>
          <Link className="admin-text-link" to="/admin/orders">View all orders →</Link>
        </div>

        {loading ? <p className="admin-table-message">Loading recent orders…</p> : recentOrders.length === 0 ? (
          <div className="admin-orders-empty">
            <h3>No orders yet</h3>
            <p>Orders submitted through checkout will appear here.</p>
          </div>
        ) : (
          <div className="admin-order-table-wrap">
            <table className="admin-order-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Details</th></tr></thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{dateLabel(order.createdAt)}</td>
                    <td>{money(order.total)}</td>
                    <td><span className={`order-status-badge status-${order.status?.toLowerCase()}`}>{statusLabel(order.status)}</span></td>
                    <td><Link className="admin-table-view" to={`/admin/orders?order=${order.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
