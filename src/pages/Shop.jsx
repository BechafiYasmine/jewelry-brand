import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import products from '../data/products'
import ProductCard from '../components/ProductCard'

function Shop() {
  const [searchParams] = useSearchParams()

  const initialCategory = searchParams.get('category') || 'All'

  const [category, setCategory] = useState(initialCategory)

  const categories = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Sets']

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

        <div className="shop-count">{filteredProducts.length} pieces</div>

        <div className="product-grid shop-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Shop
