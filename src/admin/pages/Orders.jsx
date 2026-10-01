
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAdminOrder, getAdminOrders, setAdminOrderStatus } from '../../services/adminService'

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const money = (amount) => `${Number(amount || 0).toLocaleString()} DZD`
const dateLabel = (value) => new Date(value).toLocaleString()
const statusLabel = (status) => status === 'PROCESSING' ? 'Preparing' : `${status?.[0] || ''}${status?.slice(1).toLowerCase() || ''}`

function Orders() {
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const [orders, setOrders] = useState([])
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState('ALL')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedOrder, setSelectedOrder] = useState(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [updating, setUpdating] = useState(false)

	const loadOrders = useCallback(async () => {
		setLoading(true)
		setError('')
		try {
			const data = await getAdminOrders({ search, status })
			setOrders(data.orders || [])
		} catch (err) {
			if (err.status === 401) {
				window.localStorage.removeItem('adminToken')
				navigate('/admin/login', { replace: true })
				return
			}
			setError(err.message || 'Could not load orders.')
		} finally {
			setLoading(false)
		}
	}, [search, status, navigate])

	useEffect(() => {
		const timer = window.setTimeout(loadOrders, 250)
		return () => window.clearTimeout(timer)
	}, [loadOrders])

	const openOrder = useCallback(async (id) => {
		setDetailLoading(true)
		setError('')
		try {
			const order = await getAdminOrder(id)
			setSelectedOrder(order)
		} catch (err) {
			if (err.status === 401) {
				window.localStorage.removeItem('adminToken')
				navigate('/admin/login', { replace: true })
				return
			}
			setError(err.message || 'Could not load order details.')
			setSearchParams({}, { replace: true })
		} finally {
			setDetailLoading(false)
		}
	}, [navigate, setSearchParams])

	useEffect(() => {
		const orderId = searchParams.get('order')
		if (orderId) openOrder(orderId)
		else setSelectedOrder(null)
	}, [searchParams, openOrder])

	function closeOrder() {
		setSelectedOrder(null)
		setSearchParams({}, { replace: true })
	}

	async function changeOrderStatus(nextStatus) {
		if (!selectedOrder || updating) return
		setUpdating(true)
		setError('')
		try {
			const updated = await setAdminOrderStatus(selectedOrder.id, nextStatus)
			setSelectedOrder(updated)
			setOrders((current) => current.map((order) => order.id === updated.id ? { ...order, status: updated.status } : order))
			loadOrders()
		} catch (err) {
			if (err.status === 401) {
				window.localStorage.removeItem('adminToken')
				navigate('/admin/login', { replace: true })
				return
			}
			setError(err.message || 'Could not update order status.')
		} finally {
			setUpdating(false)
		}
	}

	return (
		<section className="admin-orders-page">
			<div className="admin-orders-toolbar">
				<div>
					<p className="admin-dashboard-eyebrow">STORE MANAGEMENT</p>
					<h2>Orders</h2>
					<p>Search customer purchases and follow their delivery progress.</p>
				</div>
				<button type="button" className="admin-action-button admin-action-button-light" onClick={loadOrders} disabled={loading}>
					{loading ? 'Refreshing…' : 'Refresh orders'}
				</button>
			</div>

			{error && <p className="admin-feedback admin-feedback-error" role="alert">{error}</p>}

			<div className="admin-order-filters">
				<label className="admin-order-search">
					<span aria-hidden="true">⌕</span>
					<input aria-label="Search orders" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, phone, or order number…" />
				</label>
				<label className="admin-order-status-filter">
					<span className="admin-sr-only">Filter by status</span>
					<select value={status} onChange={(event) => setStatus(event.target.value)}>
						<option value="ALL">All statuses</option>
						{STATUSES.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}
					</select>
				</label>
				<span className="admin-product-count">{loading ? 'Loading…' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}</span>
			</div>

			{loading ? <div className="admin-product-empty">Loading orders…</div> : orders.length === 0 ? (
				<div className="admin-orders-empty"><h3>No matching orders</h3><p>Try another search or status filter.</p></div>
			) : (
				<div className="admin-order-table-wrap">
					<table className="admin-order-table">
						<thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Details</th></tr></thead>
						<tbody>
							{orders.map((order) => (
								<tr key={order.id}>
									<td>#{order.orderNumber}</td>
									<td><strong>{order.customerName}</strong><small className="admin-order-phone">{order.phone}</small></td>
									<td>{dateLabel(order.createdAt)}</td>
									<td>{money(order.total)}</td>
									<td><span className={`order-status-badge status-${order.status?.toLowerCase()}`}>{statusLabel(order.status)}</span></td>
									<td><button className="admin-table-view" type="button" onClick={() => setSearchParams({ order: String(order.id) })}>View</button></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{(detailLoading || selectedOrder) && (
				<div className="admin-order-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOrder() }}>
					<section className="admin-order-modal" role="dialog" aria-modal="true" aria-labelledby="admin-order-modal-title">
						<header className="admin-order-modal-header">
							<div><p className="admin-dashboard-eyebrow">ORDER DETAILS</p><h2 id="admin-order-modal-title">{selectedOrder ? `#${selectedOrder.orderNumber}` : 'Loading order…'}</h2></div>
							<button type="button" aria-label="Close order details" onClick={closeOrder}>×</button>
						</header>
						{detailLoading || !selectedOrder ? <p className="admin-modal-loading">Loading order details…</p> : (
							<div className="admin-order-modal-body">
								<div className="admin-order-detail-grid">
									<section><h3>Customer</h3><strong>{selectedOrder.customerName}</strong><p>{selectedOrder.phone}</p></section>
									<section><h3>Delivery</h3><strong>{selectedOrder.deliveryMethod === 'home' ? 'Home delivery' : 'Office delivery'}</strong><p>{selectedOrder.commune}, {selectedOrder.wilaya}</p>{selectedOrder.notes && <p>Notes: {selectedOrder.notes}</p>}</section>
									<section><h3>Order</h3><p>{dateLabel(selectedOrder.createdAt)}</p><p>{selectedOrder.items.length} line items</p></section>
								</div>
								<section className="admin-modal-products"><h3>Products</h3>
									{selectedOrder.items.map((item) => <div className="admin-modal-product-row" key={item.id}><div>{item.product.imageUrl && <img src={item.product.imageUrl} alt="" />}<span><strong>{item.product.name}</strong><small>Qty {item.quantity} · {money(item.unitPrice)} each</small></span></div><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}
								</section>
								<div className="admin-modal-totals"><p><span>Subtotal</span><strong>{money(selectedOrder.subtotal)}</strong></p><p><span>Delivery</span><strong>{money(selectedOrder.deliveryFee)}</strong></p><p className="admin-modal-grand-total"><span>Total</span><strong>{money(selectedOrder.total)}</strong></p></div>
								<div className="admin-modal-status"><label htmlFor="order-status">Order status</label><select id="order-status" value={selectedOrder.status === 'PROCESSING' ? 'PREPARING' : selectedOrder.status} disabled={updating} onChange={(event) => changeOrderStatus(event.target.value)}>{STATUSES.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select>{updating && <small>Saving status…</small>}</div>
							</div>
						)}
					</section>
				</div>
			)}
		</section>
	)
}

export default Orders
