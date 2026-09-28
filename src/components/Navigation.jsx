import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      <Link to="/">Home</Link>
      <Link to="/shop">Shop</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  )
}

export default Navigation
