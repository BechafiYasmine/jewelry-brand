import { Navigate, Outlet } from 'react-router-dom'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

function AdminLayout() {
	if (!window.localStorage.getItem('adminToken')) {
		return <Navigate to="/admin/login" replace />
	}

	return (
		<div className="admin-app-shell">
			<AdminSidebar />
			<div className="admin-app-main">
				<AdminHeader />
				<Outlet />
			</div>
		</div>
	)
}

export default AdminLayout
