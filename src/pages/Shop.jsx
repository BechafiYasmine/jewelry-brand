import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/productService'

function Shop() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setCategory(searchParams.get('category') || 'All')
  }, [searchParams])

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      try {
        setLoading(true)
        setError('')
        const data = await getProducts()

        if (isMounted) {
          setProducts(data)
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load products right now. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Sets']
  const showShopError = !loading && products.length === 0 && Boolean(error)

  const filteredProducts =
    category === 'All'
      ? products
      : products.filter((product) => product.category === category)

  return (
    <main className="shop-page">
      <section className="page-header">
        <span className="eyebrow">THE COLLECTION</span>

        <h1>Shop all pieces</h1>

        <p>
          Discover delicate jewelry designed to become part of your everyday story.
        </p>
      </section>

      <section className="shop-content">
        <div className="category-filter">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {showShopError ? (
          <p className="empty-state">{error}</p>
        ) : (
          <>
            <div className="shop-count">
              {loading ? 'Loading pieces...' : `${filteredProducts.length} pieces`}
            </div>

            {loading ? (
              <p className="empty-state">Loading collection...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="empty-state">No pieces available in this category right now.</p>
            ) : (
              <div className="product-grid shop-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Shop
