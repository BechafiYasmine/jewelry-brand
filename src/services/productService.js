const API_BASE_URL = 'http://localhost:5000/api'

function normalizeProduct(product) {
  return {
    ...product,
    id: Number(product.id),
    image: product.imageUrl || product.image || '',
    badge: product.badge || 'New',
    material: product.material || 'Gold plated',
    colorOptions:
      product.colorOptions || [
        { name: 'Gold', hex: '#c5a56b' },
        { name: 'Silver', hex: '#c8c8c5' },
        { name: 'Rose gold', hex: '#c98f7d' },
      ],
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function getProducts() {
  const data = await fetchJson(`${API_BASE_URL}/products`)
  const rawProducts = Array.isArray(data?.products)
    ? data.products
    : Array.isArray(data)
      ? data
      : []

  return rawProducts.map(normalizeProduct)
}

export async function getProductById(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  const data = await response.json()
  return normalizeProduct(data.product || data)
}
