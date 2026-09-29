import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import heroImage from '../assets/lunea-hero.png'

import products from '../data/products'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'

function Home() {
  const newArrivals = products.slice(0, 4)
  const bestSellers = products.slice(1, 5)

  const categories = [
    {
      name: 'Rings',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
    },
    {
      name: 'Earrings',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
    },
    {
      name: 'Necklaces',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
    },
    {
      name: 'Bracelets',
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85',
    },
    {
      name: 'Sets',
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85',
    },
  ]

  const titleContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.5,
      },
    },
  }

  const titleLine = {
    hidden: {
      opacity: 0,
      y: 70,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <main>
      <section className="hero">
        <motion.div
          className="hero-image"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <img
            src={heroImage}
            alt="Lunéa jewelry collection"
          />
        </motion.div>

        <div className="hero-overlay"></div>

        <motion.div
          className="hero-glow"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="hero-orbit"
          animate={{ rotate: 360 }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <span />
        </motion.div>

        <div className="hero-content">
          <motion.div
            className="hero-eyebrow-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.35,
            }}
          >
            <span className="eyebrow hero-eyebrow">THE NEW COLLECTION</span>
          </motion.div>

          <motion.h1 variants={titleContainer} initial="hidden" animate="visible">
            <motion.span variants={titleLine}>Jewelry made</motion.span>
            <motion.span variants={titleLine}>to be</motion.span>
            <motion.span variants={titleLine}>remembered.</motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 1.15,
            }}
          >
            Delicate pieces designed for your everyday moments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 1.3,
            }}
          >
            <Link to="/shop" className="hero-button">
              <span>Discover the collection</span>
              <span className="button-arrow">↗</span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 2,
            duration: 1,
          }}
        >
          <span>SCROLL TO EXPLORE</span>

          <motion.div
            className="scroll-line"
            animate={{
              scaleY: [0, 1, 0],
              transformOrigin: ['top', 'top', 'bottom'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>

        <div className="hero-number">01 — 04</div>
      </section>

      <section className="brand-marquee" aria-label="Lunéa brand values">
        <div className="brand-marquee-track">
          <div className="brand-marquee-copy">
            <span>MADE TO BE TREASURED</span>
            <i aria-hidden="true">✦</i>
            <span>EVERYDAY ELEGANCE</span>
            <i aria-hidden="true">✦</i>
            <span>DESIGNED WITH INTENTION</span>
            <i aria-hidden="true">✦</i>
          </div>
          <div className="brand-marquee-copy" aria-hidden="true">
            <span>MADE TO BE TREASURED</span>
            <i>✦</i>
            <span>EVERYDAY ELEGANCE</span>
            <i>✦</i>
            <span>DESIGNED WITH INTENTION</span>
            <i>✦</i>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <span className="section-eyebrow">EXPLORE LUNÉA</span>
          <h2>Find your perfect piece</h2>
          <p>
            Discover timeless pieces designed to become part of your everyday
            story.
          </p>
        </div>

        <div
          className="categories-grid"
          role="region"
          aria-label="Browse jewelry categories"
          tabIndex={0}
        >
          <div className="image-marquee-track category-marquee-track">
            {[0, 1, 2].map((copyIndex) => {
              const isClone = copyIndex > 0

              return (
                <div
                  className="image-marquee-group category-marquee-group"
                  key={`categories-${copyIndex}`}
                  aria-hidden={isClone || undefined}
                >
                  {categories.map((category) => (
                    <CategoryCard
                      key={`${isClone ? 'clone-' : ''}${category.name}`}
                      {...category}
                      isClone={isClone}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="section-heading section-heading-row">
          <div>
            <span className="section-eyebrow">JUST IN</span>
            <h2>New arrivals</h2>
          </div>
          <Link to="/shop" className="view-all-button">
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div
          className="product-grid editorial-product-grid"
          role="region"
          aria-label="New arrivals"
          tabIndex={0}
        >
          <div className="image-marquee-track product-marquee-track">
            {[0, 1, 2].map((copyIndex) => {
              const isClone = copyIndex > 0

              return (
                <div
                  className="image-marquee-group product-marquee-group"
                  key={`arrivals-${copyIndex}`}
                  aria-hidden={isClone || undefined}
                >
                  {newArrivals.map((product) => (
                    <ProductCard
                      key={`${isClone ? 'clone-' : ''}${product.id}`}
                      product={product}
                      isClone={isClone}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="collections-section">
        <div className="section-heading">
          <span className="section-eyebrow">CURATED FOR YOU</span>
          <h2>Featured collections</h2>
          <p>Discover the stories behind our most-loved pieces.</p>
        </div>

        <div className="collections-grid">
          <Collection
            number="01"
            title="Gold Collection"
            image="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1400&q=85"
            large
          />
          <Collection
            number="02"
            title="Everyday Essentials"
            image="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85"
          />
          <Collection
            number="03"
            title="The Gift Edit"
            image="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85"
          />
        </div>
      </section>

      <section className="products-section best-sellers-section">
        <div className="section-heading section-heading-row">
          <div>
            <span className="section-eyebrow">LOVED BY MANY</span>
            <h2>Best sellers</h2>
          </div>
          <Link to="/shop" className="view-all-button">
            Shop best sellers <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div
          className="product-grid editorial-product-grid"
          role="region"
          aria-label="Best sellers"
          tabIndex={0}
        >
          <div className="image-marquee-track product-marquee-track">
            {[0, 1, 2].map((copyIndex) => {
              const isClone = copyIndex > 0

              return (
                <div
                  className="image-marquee-group product-marquee-group"
                  key={`bestsellers-${copyIndex}`}
                  aria-hidden={isClone || undefined}
                >
                  {bestSellers.map((product) => (
                    <ProductCard
                      key={`${isClone ? 'clone-' : ''}${product.id}`}
                      product={{ ...product, badge: 'Bestseller' }}
                      isClone={isClone}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="promotion-section">
        <div className="promotion-image">
          <img
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=85"
            alt="Lunéa jewelry promotion"
          />
        </div>
        <div className="promotion-content">
          <span className="section-eyebrow">CURRENT PROMOTION</span>
          <h2>
            A little more
            <br />
            to love.
          </h2>
          <p>Enjoy special prices on selected pieces for a limited time.</p>
          <Link to="/shop" className="dark-outline-button">
            Discover the offer <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Link to="/shop" className="delivery-banner">
        <div className="delivery-icon" aria-hidden="true">✦</div>
        <div>
          <span>A LITTLE EXTRA</span>
          <h2>Free delivery on orders over 6,500 DZD</h2>
        </div>
        <div className="delivery-arrow" aria-hidden="true">→</div>
      </Link>
    </main>
  )
}

function Collection({ number, title, image, large = false }) {
  return (
    <motion.div
      className={`collection-card${large ? ' collection-large' : ''}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <motion.img
        src={image}
        alt={title}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 1 }}
      />

      <div className="collection-overlay" />

      <div className="collection-content">
        <span>{number}</span>
        <h3>{title}</h3>
        <Link to="/shop" className="collection-link">
          Explore collection <span>→</span>
        </Link>
      </div>
    </motion.div>
  )
}

export default Home
