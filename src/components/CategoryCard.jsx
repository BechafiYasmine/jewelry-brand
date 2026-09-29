import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function CategoryCard({ name, image }) {
  return (
    <motion.div
      className="category-card"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/shop?category=${encodeURIComponent(name)}`} aria-label={`Shop ${name}`}>
        <img src={image} alt={`${name} jewelry`} />
        <div className="category-overlay">
          <span>{name}</span>
          <span className="category-arrow" aria-hidden="true">↗</span>
        </div>
      </Link>
    </motion.div>
  )
}

export default CategoryCard