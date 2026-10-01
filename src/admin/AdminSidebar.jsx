import { NavLink } from 'react-router-dom'

function AdminSidebar() {
	return (
		<aside className="admin-app-sidebar">
			<a className="admin-app-mark" href="/admin" aria-label="LUNÉA admin home">
				<span className="admin-app-mark-icon">L</span>
				<span>LUNÉA<small>ADMIN STUDIO</small></span>
			</a>
			<span className="admin-app-nav-label">WORKSPACE</span>
			<nav className="admin-app-nav" aria-label="Admin navigation">
				<NavLink end to="/admin"><span aria-hidden="true">◫</span> Overview</NavLink>
				<NavLink to="/admin/orders"><span aria-hidden="true">▤</span> Orders</NavLink>
				<NavLink to="/admin/products"><span aria-hidden="true">◇</span> Products</NavLink>
			</nav>
			<div className="admin-app-sidebar-note">
				<span>CATALOG CARE</span>
				<p>Thoughtful details make every piece feel personal.</p>
			</div>
		</aside>
	)
}

export default AdminSidebar
