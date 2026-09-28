import { Link, useParams } from 'react-router-dom'
import products from '../data/products'

function Product() {
  const { id } = useParams()

  const product = products.find((item) => item.id === Number(id))

  if (!product) {
    return (
      <main className="not-found">
        <h1>Piece not found</h1>
        <Link to="/shop" className="button button-dark">
          Back to shop
        </Link>
      </main>
    )
  }

  const whatsappNumber = '213XXXXXXXXX'

  const message = encodeURIComponent(
    `Hello! I'm interested in ordering the ${product.name} from Lunéa.`,
  )

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <main className="product-page">
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-info">
          <span className="eyebrow">{product.category}</span>

          <h1>{product.name}</h1>

          <p className="detail-price">{product.price.toLocaleString()} DA</p>

          <div className="detail-divider"></div>

          <p className="detail-description">{product.description}</p>

          <div className="detail-info-block">
            <span>Material</span>
            <p>{product.material}</p>
          </div>

          <div className="detail-info-block">
            <span>Details</span>
            <p>
              Carefully designed for everyday wear. Lightweight and easy to style.
            </p>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="button button-dark whatsapp-button"
          >
            Order via WhatsApp
          </a>

          <div className="product-note">
            <span>♡</span>
            <p>
              Need help choosing your piece? Contact us and we'll be happy to help.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Product
