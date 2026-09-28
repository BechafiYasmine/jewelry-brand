import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <h2>LUNÉA</h2>
          <p>Delicate pieces designed to become part of your story.</p>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <Link to="/shop">Shop</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-column">
          <h4>Collections</h4>
          <Link to="/shop?category=Necklaces">Necklaces</Link>
          <Link to="/shop?category=Rings">Rings</Link>
          <Link to="/shop?category=Earrings">Earrings</Link>
          <Link to="/shop?category=Bracelets">Bracelets</Link>
        </div>

        <div className="footer-column">
          <h4>Follow</h4>
          <a href="#" target="_blank">Instagram</a>
          <a href="#" target="_blank">TikTok</a>
          <a href="#" target="_blank">WhatsApp</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 LUNÉA</span>
        <span>Made with intention.</span>
      </div>
    </footer>
  )
}

export default Footer
