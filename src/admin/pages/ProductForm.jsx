import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
	createAdminProduct,
	getAdminProduct,
	updateAdminProduct,
	uploadProductImage,
} from '../../services/adminService'

const CATEGORIES = ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Sets']
const EMPTY_FORM = {
	name: '',
	slug: '',
	description: '',
	category: 'Necklaces',
	price: '',
	stock: '',
	badge: '',
	imageUrl: '',
	isActive: true,
}

function slugify(value) {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function ProductForm() {
	const { id } = useParams()
	const isEditing = Boolean(id)
	const navigate = useNavigate()
	const [form, setForm] = useState(EMPTY_FORM)
	const [previewUrl, setPreviewUrl] = useState('')
	const [loading, setLoading] = useState(isEditing)
	const [saving, setSaving] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState('')
	const [autoSlug, setAutoSlug] = useState(!isEditing)

	useEffect(() => {
		if (!id) return undefined
		let active = true
		getAdminProduct(id)
			.then((product) => {
				if (!active) return
				setForm({
					name: product.name ?? '',
					slug: product.slug ?? '',
					description: product.description ?? '',
					category: product.category ?? 'Necklaces',
					price: String(product.price ?? ''),
					stock: String(product.stock ?? ''),
					badge: product.badge ?? '',
					imageUrl: product.imageUrl ?? '',
					isActive: product.isActive !== false,
				})
				setPreviewUrl(product.imageUrl ?? '')
				setAutoSlug(false)
			})
			.catch((err) => {
				if (err.status === 401) {
					window.localStorage.removeItem('adminToken')
					navigate('/admin/login', { replace: true })
					return
				}
				if (active) setError(err.message || 'Could not load this product.')
			})
			.finally(() => { if (active) setLoading(false) })
		return () => { active = false }
	}, [id, navigate])

	useEffect(() => {
		return () => {
			if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
		}
	}, [previewUrl])

	const pageTitle = isEditing ? 'Edit product' : 'Add a product'

	function updateField(event) {
		const { name, value, checked, type } = event.target
		if (name === 'name' && autoSlug) {
			setForm((current) => ({ ...current, name: value, slug: slugify(value) }))
			return
		}
		setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
	}

	async function handleImageChange(event) {
		const file = event.target.files?.[0]
		event.target.value = ''
		if (!file) return
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			setError('Choose a JPG, PNG, or WebP image.')
			return
		}
		if (file.size > 5 * 1024 * 1024) {
			setError('Image must be 5 MB or smaller.')
			return
		}

		setError('')
		const oldPreview = previewUrl
		const localPreview = URL.createObjectURL(file)
		setPreviewUrl(localPreview)
		setUploading(true)
		try {
			const imageUrl = await uploadProductImage(file)
			setForm((current) => ({ ...current, imageUrl }))
			setPreviewUrl(imageUrl)
		} catch (err) {
			setPreviewUrl(oldPreview)
			if (err.status === 401) {
				window.localStorage.removeItem('adminToken')
				navigate('/admin/login', { replace: true })
				return
			}
			setError(err.message || 'Could not upload the image.')
		} finally {
			setUploading(false)
		}
	}

	async function handleSubmit(event) {
		event.preventDefault()
		setError('')
		if (!form.name.trim() || !form.slug.trim() || !form.description.trim() || !form.imageUrl) {
			setError('Complete the required fields and upload a product image before saving.')
			return
		}
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
			setError('Use lowercase letters, numbers, and hyphens in the slug.')
			return
		}
		if (!Number.isSafeInteger(Number(form.price)) || Number(form.price) < 0) {
			setError('Price must be a non-negative whole number.')
			return
		}
		if (!Number.isSafeInteger(Number(form.stock)) || Number(form.stock) < 0) {
			setError('Stock must be a non-negative whole number.')
			return
		}

		setSaving(true)
		const product = {
			...form,
			name: form.name.trim(),
			slug: form.slug.trim(),
			description: form.description.trim(),
			price: Number(form.price),
			stock: Number(form.stock),
			badge: form.badge.trim() || null,
			imageUrl: form.imageUrl,
			isActive: form.isActive,
		}
		try {
			if (isEditing) await updateAdminProduct(id, product)
			else await createAdminProduct(product)
			navigate('/admin/products', { state: { notice: isEditing ? 'Product changes saved.' : 'Product added to the catalog.' } })
		} catch (err) {
			if (err.status === 401) {
				window.localStorage.removeItem('adminToken')
				navigate('/admin/login', { replace: true })
				return
			}
			setError(err.message || 'Could not save the product.')
		} finally {
			setSaving(false)
		}
	}

	if (loading) return <section className="admin-product-form-page"><p>Loading product…</p></section>

	return (
		<section className="admin-product-form-page">
			<div className="admin-form-page-heading">
				<div>
					<p className="admin-dashboard-eyebrow">CATALOG · {isEditing ? 'EDIT' : 'NEW PIECE'}</p>
					<h2>{pageTitle}</h2>
					<p>Add the details that help each piece find its person.</p>
				</div>
				<Link to="/admin/products" className="admin-action-button admin-action-button-light">← Back to products</Link>
			</div>

			{error && <p className="admin-feedback admin-feedback-error" role="alert">{error}</p>}

			<form className="admin-product-form" onSubmit={handleSubmit}>
				<div className="admin-product-form-fields">
					<label className="admin-form-field admin-form-field-wide">
						<span>Product name <b>*</b></span>
						<input name="name" value={form.name} onChange={updateField} maxLength={160} required placeholder="e.g. Celeste Ring" />
					</label>
					<label className="admin-form-field">
						<span>URL slug <b>*</b></span>
						<input name="slug" value={form.slug} onChange={(event) => { setAutoSlug(false); updateField(event) }} required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="celeste-ring" />
						<small>Used in the product URL. Lowercase letters, numbers, and hyphens.</small>
					</label>
					<label className="admin-form-field">
						<span>Category <b>*</b></span>
						<select name="category" value={form.category} onChange={updateField} required>
							{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
						</select>
					</label>
					<label className="admin-form-field admin-form-field-wide">
						<span>Description <b>*</b></span>
						<textarea name="description" value={form.description} onChange={updateField} rows={5} maxLength={5000} required placeholder="Describe the materials, shape, and details…" />
					</label>
					<label className="admin-form-field">
						<span>Price (DA) <b>*</b></span>
						<input name="price" type="number" min="0" step="1" value={form.price} onChange={updateField} required />
					</label>
					<label className="admin-form-field">
						<span>Stock quantity <b>*</b></span>
						<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateField} required />
					</label>
					<label className="admin-form-field">
						<span>Badge <small>(optional)</small></span>
						<input name="badge" value={form.badge} onChange={updateField} maxLength={60} placeholder="New, Bestseller…" />
					</label>
					<label className="admin-active-toggle">
						<input type="checkbox" name="isActive" checked={form.isActive} onChange={updateField} />
						<span><strong>Active in storefront</strong><small>Customers can view and order this product.</small></span>
					</label>
				</div>

				<aside className="admin-image-uploader">
					<span className="admin-image-uploader-title">Product image <b>*</b></span>
					<div className={`admin-image-preview${previewUrl ? ' has-image' : ''}`}>
						{previewUrl ? <img src={previewUrl} alt="Product preview" /> : <div><span aria-hidden="true">◇</span><p>Image preview</p></div>}
					</div>
					<label className="admin-upload-button">
						{uploading ? 'Uploading securely…' : previewUrl ? 'Choose a different image' : 'Upload image'}
						<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} disabled={uploading || saving} />
					</label>
					<p className="admin-upload-help">JPG, PNG, or WebP · up to 5 MB. Image uploads directly to Cloudinary.</p>
					{uploading && <p className="admin-upload-progress" role="status">Uploading image… Please keep this page open.</p>}
					{form.imageUrl && !uploading && <p className="admin-upload-ready" role="status">Image ready to save</p>}
				</aside>

				<div className="admin-product-form-actions">
					<Link to="/admin/products" className="admin-action-button admin-action-button-light">Cancel</Link>
					<button className="admin-action-button" type="submit" disabled={saving || uploading}>
						{saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
					</button>
				</div>
			</form>
		</section>
	)
}

export default ProductForm
