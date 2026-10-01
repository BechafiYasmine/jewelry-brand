import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { deactivateAdminProduct, getAdminProducts, setAdminProductActive } from '../../services/adminService'

const CATEGORIES = ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Sets']

function Products() {
	const navigate = useNavigate()
	const location = useLocation()
	const [products, setProducts] = useState([])
	const [search, setSearch] = useState('')
	const [category, setCategory] = useState('All')
	const [status, setStatus] = useState('all')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [notice, setNotice] = useState('')
	const [busyId, setBusyId] = useState(null)

	const loadProducts = useCallback(async () => {
		setError('')
		try {
			const data = await getAdminProducts({ search, category, status })
			setProducts(data.products || [])
		} catch (err) {
			if (err.status === 401) {
				window.localStorage.removeItem('adminToken')
				navigate('/admin/login', { replace: true })
				return
			}
			setError(err.message || 'Could not load the product catalog.')
		} finally {
			setLoading(false)
		}
	}, [search, category, status, navigate])

	useEffect(() => {
		loadProducts()
	}, [loadProducts])

	async function changeActive(product) {
		if (product.isActive && !window.confirm(`Deactivate “${product.name}”? It will disappear from the storefront, but its order history will be preserved.`)) return
		setBusyId(product.id)
		setNotice('')
		setError('')
		try {
			const updated = product.isActive
				? await deactivateAdminProduct(product.id).then((result) => result.product)
				: await setAdminProductActive(product.id, true)
			setLoading(true)
			await loadProducts()
			setNotice(`${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}.`)
		} catch (err) {
			if (err.status === 401) {
				window.localStorage.removeItem('adminToken')
				navigate('/admin/login', { replace: true })
				return
			}
			setError(err.message || 'Could not update product status.')
		} finally {
			setBusyId(null)
		}
	}

	return (
		<section className="admin-products-page">
			<div className="admin-products-toolbar">
				<div>
					<p className="admin-dashboard-eyebrow">CATALOG MANAGEMENT</p>
					<h2>Products</h2>
					<p>Manage your collection, pricing, stock, and availability.</p>
				</div>
				<div className="admin-products-toolbar-actions">
					<button type="button" className="admin-action-button admin-action-button-light" onClick={() => { setLoading(true); loadProducts() }} disabled={loading}>
						{loading ? 'Refreshing…' : 'Refresh'}
					</button>
					<Link className="admin-action-button" to="/admin/products/new">＋ Add product</Link>
				</div>
			</div>

			{(location.state?.notice || notice) && <p className="admin-feedback admin-feedback-success" role="status">{location.state?.notice || notice}</p>}
			{error && <p className="admin-feedback admin-feedback-error" role="alert">{error}</p>}

			<div className="admin-product-filters">
				<label className="admin-search-field">
					<span className="admin-sr-only">Search products</span>
					<span aria-hidden="true">⌕</span>
					<input value={search} onChange={(event) => { setLoading(true); setSearch(event.target.value) }} placeholder="Search product name…" />
				</label>
				<label>
					<span className="admin-sr-only">Filter by category</span>
					<select value={category} onChange={(event) => { setLoading(true); setCategory(event.target.value) }}>
						<option value="All">All categories</option>
						{CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
					</select>
				</label>
				<label>
					<span className="admin-sr-only">Filter by status</span>
					<select value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value) }}>
						<option value="all">All statuses</option>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</label>
				<span className="admin-product-count">{loading ? 'Loading…' : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`}</span>
			</div>

			{loading ? (
				<div className="admin-product-empty">Loading your catalog…</div>
			) : error && products.length === 0 ? null : products.length === 0 ? (
				<div className="admin-product-empty">
					<span aria-hidden="true">◇</span>
					<h3>No products found</h3>
					<p>Try changing your search or filters, or add a new piece to the catalog.</p>
					<Link className="admin-action-button" to="/admin/products/new">Add your first product</Link>
				</div>
			) : (
				<div className="admin-product-table-wrap">
					<table className="admin-product-table">
						<thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className="admin-sr-only">Actions</span></th></tr></thead>
						<tbody>
							{products.map((product) => (
								<tr key={product.id}>
									<td>
										<div className="admin-product-identity">
											<img src={product.imageUrl} alt="" />
											<div><strong>{product.name}</strong><small>/{product.slug}</small></div>
										</div>
									</td>
									<td>{product.category}</td>
									<td>{Number(product.price).toLocaleString()} DA</td>
									<td><span className={product.stock <= 5 ? 'admin-stock-low' : ''}>{product.stock}</span></td>
									<td><span className={`admin-status-pill ${product.isActive ? 'is-active' : 'is-inactive'}`}>{product.isActive ? 'Active' : 'Inactive'}</span></td>
									<td>
										<div className="admin-product-row-actions">
											<Link to={`/admin/products/${product.id}/edit`}>Edit</Link>
											<button type="button" disabled={busyId === product.id} onClick={() => changeActive(product)}>
												{product.isActive ? 'Deactivate' : 'Activate'}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	)
}

export default Products
