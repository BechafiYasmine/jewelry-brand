import { useState } from 'react'
import { Link } from 'react-router-dom'

function ProductCard({ product, isClone = false }) {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        {product.badge && <span className="product-badge">{product.badge}</span>}

        <Link
          to={`/product/${product.id}`}
          className="product-image-link"
          tabIndex={isClone ? -1 : undefined}
        >
          <img src={product.image} alt={product.name} className="product-image" />
          <span className="view-product">View piece</span>
        </Link>

        <button
          type="button"
          className={`product-heart${isSaved ? ' is-saved' : ''}`}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isSaved}
          tabIndex={isClone ? -1 : undefined}
          onClick={() => setIsSaved((saved) => !saved)}
        >
          {isSaved ? '♥' : '♡'}
        </button>

      </div>

      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <span>{product.category}</span>
        </div>

        <p>{product.price.toLocaleString()} DZD</p>
      </div>
    </article>
  )
}

export default ProductCard
