import { Link } from 'react-router-dom'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-wrapper">
        <img src={product.image} alt={product.name} className="product-image" />

        <span className="view-product">View piece</span>
      </Link>

      <div className="product-info">
        <div>
          <h3>{product.name}</h3>
          <p>{product.category}</p>
        </div>

        <span className="product-price">{product.price.toLocaleString()} DA</span>
      </div>
    </article>
  )
}

export default ProductCard
