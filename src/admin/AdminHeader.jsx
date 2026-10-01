import { Link, useLocation, useNavigate } from 'react-router-dom'

function AdminHeader() {
	const location = useLocation()
	const navigate = useNavigate()
	const isProducts = location.pathname.startsWith('/admin/products')
	const isOrders = location.pathname.startsWith('/admin/orders')

	function logout() {
		window.localStorage.removeItem('adminToken')
		navigate('/admin/login', { replace: true })
	}

	return (
		<header className="admin-app-header">
			<div>
				<span className="admin-app-eyebrow">LUNÉA ATELIER · ADMIN</span>
				<h1>{isProducts ? 'Product catalog' : isOrders ? 'Orders' : 'Store overview'}</h1>
			</div>
			<div className="admin-app-header-actions">
				<Link to="/" className="admin-app-store-link">View storefront ↗</Link>
				<button type="button" className="admin-app-logout" onClick={logout}>Sign out</button>
			</div>
		</header>
	)
}

export default AdminHeader
