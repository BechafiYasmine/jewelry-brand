import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <motion.header
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          LUNÉA
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/shop" onClick={closeMenu}>
            Shop
          </NavLink>

          <NavLink to="/about" onClick={closeMenu}>
            Our Story
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/shop" className="nav-heart" aria-label="Shop">
            ♡
          </Link>

          <Link to="/shop" className="nav-bag" aria-label="Shopping bag">
            Bag
          </Link>
        </div>

        <button
          className={`menu-button ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          <span />
          <span />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar
