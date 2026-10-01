const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ADMIN_API = `${API_URL}/api/admin`
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function request(path, options = {}) {
	const token = window.localStorage.getItem('adminToken')
	if (!token) {
		const error = new Error('Your admin session has expired. Please sign in again.')
		error.status = 401
		throw error
	}

	const response = await fetch(`${ADMIN_API}${path}`, {
		...options,
		headers: {
			Authorization: `Bearer ${token}`,
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...options.headers,
		},
	})
	const data = await response.json().catch(() => ({}))
	if (!response.ok) {
		const error = new Error(data.message || `Request failed (${response.status}).`)
		error.status = response.status
		throw error
	}
	return data
}

export function getAdminProducts(filters = {}) {
	const params = new URLSearchParams()
	if (filters.search?.trim()) params.set('search', filters.search.trim())
	if (filters.category && filters.category !== 'All') params.set('category', filters.category)
	if (filters.status && filters.status !== 'all') params.set('status', filters.status)
	const query = params.toString()
	return request(`/products${query ? `?${query}` : ''}`)
}

export async function getAdminProduct(id) {
	const data = await request(`/products/${encodeURIComponent(id)}`)
	return data.product
}

export async function createAdminProduct(product) {
	const data = await request('/products', { method: 'POST', body: JSON.stringify(product) })
	return data.product
}

export async function updateAdminProduct(id, product) {
	const data = await request(`/products/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify(product),
	})
	return data.product
}

export async function setAdminProductActive(id, isActive) {
	const data = await request(`/products/${encodeURIComponent(id)}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ isActive }),
	})
	return data.product
}

export function deactivateAdminProduct(id) {
	return request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function getAdminDashboardStats() {
	return request('/dashboard/stats')
}

export function getAdminOrders(filters = {}) {
	const params = new URLSearchParams()
	if (filters.search?.trim()) params.set('search', filters.search.trim())
	if (filters.status && filters.status !== 'ALL') params.set('status', filters.status)
	if (filters.take) params.set('take', String(filters.take))
	const query = params.toString()
	return request(`/orders${query ? `?${query}` : ''}`)
}

export async function getAdminOrder(id) {
	const data = await request(`/orders/${encodeURIComponent(id)}`)
	return data.order
}

export async function setAdminOrderStatus(id, status) {
	const data = await request(`/orders/${encodeURIComponent(id)}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ status }),
	})
	return data.order
}

export async function uploadProductImage(file, onProgress = () => {}) {
	if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
		throw new Error('Choose a JPG, PNG, or WebP image.')
	}
	if (file.size > MAX_IMAGE_SIZE_BYTES) {
		throw new Error('Image must be 5 MB or smaller.')
	}

	const signed = await request('/products/upload-signature', { method: 'POST' })
	const body = new FormData()
	body.append('file', file)
	body.append('api_key', signed.apiKey)
	body.append('timestamp', String(signed.timestamp))
	body.append('public_id', signed.publicId)
	body.append('upload_preset', signed.uploadPreset)
	body.append('allowed_formats', signed.allowedFormats)
	body.append('signature', signed.signature)

	onProgress('uploading')
	const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`, {
		method: 'POST',
		body,
	})
	const data = await response.json().catch(() => ({}))
	if (!response.ok) throw new Error(data.error?.message || 'Image upload failed.')
	if (typeof data.secure_url !== 'string' || !data.secure_url.startsWith('https://')) {
		throw new Error('Cloudinary did not return a valid secure image URL.')
	}
	onProgress('complete')
	return data.secure_url
}
