import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function ProductCard({ product }) {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="product-image-wrapper">
        {product.badge && <span className="product-badge">{product.badge}</span>}

        <Link to={`/product/${product.id}`} className="product-image-link">
          <img src={product.image} alt={product.name} className="product-image" />
          <span className="view-product">View piece</span>
        </Link>

        <button
          type="button"
          className={`product-heart${isSaved ? ' is-saved' : ''}`}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isSaved}
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
    </motion.article>
  )
}

export default ProductCard
