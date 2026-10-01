import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
	createAdminProduct,
	getAdminProduct,
	updateAdminProduct,
	uploadProductImage,
} from '../../services/adminService'
import { getProductImageStyle } from '../../services/productService'

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
	imageScale: 100,
	imagePositionX: 50,
	imagePositionY: 50,
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
	const [isDraggingImage, setIsDraggingImage] = useState(false)
	const [cropFrameSize, setCropFrameSize] = useState({ width: 0, height: 0 })
	const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 })
	const [error, setError] = useState('')
	const [autoSlug, setAutoSlug] = useState(!isEditing)
	const imageDrag = useRef(null)
	const cropFrameRef = useRef(null)
	const cropImageRef = useRef(null)

	useEffect(() => {
		const frame = cropFrameRef.current
		if (!frame) return undefined

		const updateFrameSize = () => {
			const bounds = frame.getBoundingClientRect()
			setCropFrameSize((current) => (
				current.width === bounds.width && current.height === bounds.height
					? current
					: { width: bounds.width, height: bounds.height }
			))
		}

		updateFrameSize()
		const observer = new ResizeObserver(updateFrameSize)
		observer.observe(frame)
		return () => observer.disconnect()
	}, [loading])

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
					imageScale: product.imageScale ?? 100,
					imagePositionX: product.imagePositionX ?? 50,
					imagePositionY: product.imagePositionY ?? 50,
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

	function getCropMetrics(scaleValue = form.imageScale) {
		const { width: frameWidth, height: frameHeight } = cropFrameSize
		const { width: sourceWidth, height: sourceHeight } = imageNaturalSize
		if (!frameWidth || !frameHeight || !sourceWidth || !sourceHeight) return null

		const coverScale = Math.max(frameWidth / sourceWidth, frameHeight / sourceHeight)
		const renderedWidth = sourceWidth * coverScale
		const renderedHeight = sourceHeight * coverScale
		const zoom = Number(scaleValue) / 100
		return {
			renderedWidth,
			renderedHeight,
			maxPanX: zoom > 1 ? Math.max(0, (renderedWidth * zoom - frameWidth) / 2) : 0,
			maxPanY: zoom > 1 ? Math.max(0, (renderedHeight * zoom - frameHeight) / 2) : 0,
			zoom,
		}
	}

	function imageCanPan() {
		const metrics = getCropMetrics()
		return Boolean(metrics && (metrics.maxPanX > 0 || metrics.maxPanY > 0))
	}

	function imageCanAdjust() {
		return Boolean(previewUrl) && Number(form.imageScale) > 100
	}

	function getCropImageStyle() {
		const metrics = getCropMetrics()
		if (!metrics) return getProductImageStyle(form)

		const panX = metrics.maxPanX * ((Number(form.imagePositionX) - 50) / 50)
		const panY = metrics.maxPanY * ((Number(form.imagePositionY) - 50) / 50)
		return {
			width: `${metrics.renderedWidth}px`,
			height: `${metrics.renderedHeight}px`,
			'--admin-image-pan-x': `${panX}px`,
			'--admin-image-pan-y': `${panY}px`,
			'--admin-image-scale': String(metrics.zoom),
		}
	}

	function handleCropImageLoad(event) {
		const frameBounds = cropFrameRef.current?.getBoundingClientRect()
		if (frameBounds) {
			setCropFrameSize({ width: frameBounds.width, height: frameBounds.height })
		}
		setImageNaturalSize({
			width: event.currentTarget.naturalWidth,
			height: event.currentTarget.naturalHeight,
		})
	}

	function startImageDrag(event) {
		if (!previewUrl || uploading || saving || (event.pointerType === 'mouse' && event.button !== 0)) return
		event.preventDefault()
		const metrics = getCropMetrics()
		if (!metrics || (metrics.maxPanX === 0 && metrics.maxPanY === 0)) return
		const startPanX = metrics.maxPanX * ((Number(form.imagePositionX) - 50) / 50)
		const startPanY = metrics.maxPanY * ((Number(form.imagePositionY) - 50) / 50)
		imageDrag.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			startPanX,
			startPanY,
			maxPanX: metrics.maxPanX,
			maxPanY: metrics.maxPanY,
		}
		event.currentTarget.setPointerCapture(event.pointerId)
		setIsDraggingImage(true)
	}

	function moveImage(event) {
		const drag = imageDrag.current
		if (!drag || drag.pointerId !== event.pointerId) return
		event.preventDefault()
		const positionFromPan = (startPan, delta, maxPan) => {
			if (maxPan <= 0) return 50
			const pan = Math.max(-maxPan, Math.min(maxPan, startPan + delta))
			return Math.round(50 + (pan / maxPan) * 50)
		}
		setForm((current) => ({
			...current,
			imagePositionX: positionFromPan(drag.startPanX, event.clientX - drag.startX, drag.maxPanX),
			imagePositionY: positionFromPan(drag.startPanY, event.clientY - drag.startY, drag.maxPanY),
		}))
	}

	function stopImageDrag(event) {
		if (imageDrag.current?.pointerId !== event.pointerId) return
		imageDrag.current = null
		setIsDraggingImage(false)
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId)
		}
	}

	function zoomWithWheel(event) {
		if (!previewUrl) return
		event.preventDefault()
		const direction = event.deltaY < 0 ? 1 : -1
		setForm((current) => ({
			...current,
			imageScale: Math.min(250, Math.max(100, Number(current.imageScale) + direction * 5)),
		}))
	}

	function updateImagePosition(axis, value) {
		setForm((current) => ({
			...current,
			[axis === 'x' ? 'imagePositionX' : 'imagePositionY']: Number(value),
		}))
	}

	function adjustZoom(amount) {
		setForm((current) => ({
			...current,
			imageScale: Math.min(250, Math.max(100, Number(current.imageScale) + amount)),
		}))
	}

	function nudgeImage(event) {
		if (Number(form.imageScale) <= 100) return
		const movement = event.shiftKey ? 5 : 1
		const direction = {
			ArrowLeft: [-movement, 0],
			ArrowRight: [movement, 0],
			ArrowUp: [0, -movement],
			ArrowDown: [0, movement],
		}[event.key]
		if (!direction) return
		event.preventDefault()
		setForm((current) => ({
			...current,
			imagePositionX: Math.min(100, Math.max(0, Number(current.imagePositionX) + direction[0])),
			imagePositionY: Math.min(100, Math.max(0, Number(current.imagePositionY) + direction[1])),
		}))
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
			imageScale: Number(form.imageScale),
			imagePositionX: Number(form.imagePositionX),
			imagePositionY: Number(form.imagePositionY),
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
					<div
						ref={cropFrameRef}
						className={`admin-image-preview${previewUrl ? ' has-image' : ''}${imageCanAdjust() ? ' can-pan' : ''}${isDraggingImage ? ' is-dragging' : ''}`}
						onPointerDown={startImageDrag}
						onPointerMove={moveImage}
						onPointerUp={stopImageDrag}
						onPointerCancel={stopImageDrag}
						onLostPointerCapture={stopImageDrag}
						onWheel={zoomWithWheel}
						onKeyDown={nudgeImage}
						role="group"
						aria-label={previewUrl ? 'Drag image to reposition it. Use the mouse wheel to zoom.' : undefined}
						tabIndex={previewUrl ? 0 : undefined}
					>
						{previewUrl ? <img ref={cropImageRef} src={previewUrl} alt="Product preview" draggable="false" onLoad={handleCropImageLoad} style={getCropImageStyle()} /> : <div><span aria-hidden="true">◇</span><p>Image preview</p></div>}
					</div>
					<div className="admin-image-adjustments" aria-label="Adjust image inside the fixed preview frame">
						<div className="admin-image-control">
							<div className="admin-image-control-heading">
								<span>Zoom</span>
								<strong>{form.imageScale}%</strong>
							</div>
							<div className="admin-image-zoom-control">
								<button type="button" aria-label="Zoom out" onClick={() => adjustZoom(-5)} disabled={!previewUrl || Number(form.imageScale) <= 100}>−</button>
								<input aria-label="Zoom level" type="range" min="100" max="250" step="1" value={form.imageScale} onChange={(event) => setForm((current) => ({ ...current, imageScale: Number(event.target.value) }))} disabled={!previewUrl} />
								<button type="button" aria-label="Zoom in" onClick={() => adjustZoom(5)} disabled={!previewUrl || Number(form.imageScale) >= 250}>＋</button>
							</div>
						</div>
						<div className="admin-image-control">
							<div className="admin-image-control-heading">
								<span>Move left / right</span>
								<strong>{Number(form.imagePositionX) === 50 ? 'Center' : Number(form.imagePositionX) < 50 ? 'Left' : 'Right'}</strong>
							</div>
							<input aria-label="Move image left or right" type="range" min="0" max="100" step="1" value={form.imagePositionX} onChange={(event) => updateImagePosition('x', event.target.value)} disabled={!imageCanAdjust()} />
							<div className="admin-image-range-ends"><span>Left</span><span>Right</span></div>
						</div>
						<div className="admin-image-control">
							<div className="admin-image-control-heading">
								<span>Move up / down</span>
								<strong>{Number(form.imagePositionY) === 50 ? 'Center' : Number(form.imagePositionY) < 50 ? 'Up' : 'Down'}</strong>
							</div>
							<input aria-label="Move image up or down" type="range" min="0" max="100" step="1" value={form.imagePositionY} onChange={(event) => updateImagePosition('y', event.target.value)} disabled={!imageCanAdjust()} />
							<div className="admin-image-range-ends"><span>Up</span><span>Down</span></div>
						</div>
						<p className="admin-image-pan-hint">Use the sliders for precise framing, or zoom in and drag the image.</p>
						<button type="button" onClick={() => setForm((current) => ({ ...current, imageScale: 100, imagePositionX: 50, imagePositionY: 50 }))} disabled={!previewUrl}>Reset framing</button>
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
