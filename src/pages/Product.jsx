import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import products from '../data/products'
import { useCart } from '../context/CartContext'

function Product() {
  const { addToCart } = useCart()
  const { id } = useParams()
  const [selectedColor, setSelectedColor] = useState('Gold')
  const [quantity, setQuantity] = useState(1)

  const product = products.find((item) => item.id === Number(id))

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colorOptions?.[0]?.name ?? 'Gold')
      setQuantity(1)
    }
  }, [product])

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

  const colorOptions = product.colorOptions ?? [{ name: 'Gold', hex: '#c5a56b' }]

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

          <p className="detail-price">{product.price.toLocaleString()} DZD</p>

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

          <div className="product-options">
            <div className="color-option-heading">
              <span>Color</span>
              <strong>{selectedColor}</strong>
            </div>
            <div className="color-swatches" role="group" aria-label="Choose a color">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={`color-swatch${selectedColor === color.name ? ' selected' : ''}`}
                  style={{ '--swatch-color': color.hex }}
                  aria-label={color.name}
                  aria-pressed={selectedColor === color.name}
                  onClick={() => setSelectedColor(color.name)}
                />
              ))}
            </div>
          </div>

          <div className="product-quantity-row">
            <span>Quantity</span>
            <div className="product-quantity-control" aria-label="Choose quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => current + 1)}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className="button button-dark detail-add-button"
            onClick={() => addToCart(product, quantity, selectedColor)}
          >
            Add to bag · {(product.price * quantity).toLocaleString()} DZD
          </button>

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
