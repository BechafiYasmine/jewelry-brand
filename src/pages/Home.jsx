import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import products from '../data/products'
import ProductCard from '../components/ProductCard'
import SectionTitle from '../components/SectionTitle'

function Home() {
  const featuredProducts = products.filter((product) => product.featured)

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
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=2200&q=90"
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

      <motion.section
        className="intro section-padding"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <SectionTitle
          eyebrow="A LITTLE SOMETHING SPECIAL"
          title="Elegance in every detail."
          description="Discover timeless pieces designed to bring a subtle touch of beauty to every moment."
        />
      </motion.section>

      <section className="featured section-padding">
        <SectionTitle
          eyebrow="THE EDIT"
          title="New arrivals"
          description="Pieces chosen for their simplicity, elegance and timeless character."
        />

        <motion.div
          className="product-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 60,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <div className="center-button">
          <Link to="/shop" className="button button-dark">
            View all pieces
          </Link>
        </div>
      </section>

      <section className="collections">
        <Collection
          number="01"
          title="Necklaces"
          image="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85"
        />

        <Collection
          number="02"
          title="Earrings"
          image="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85"
        />

        <Collection
          number="03"
          title="Rings"
          image="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85"
        />
      </section>

      <section className="story section-padding">
        <motion.div
          className="story-image"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1100&q=85"
            alt="Lunéa jewelry"
          />
        </motion.div>

        <motion.div
          className="story-content"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="eyebrow">OUR PHILOSOPHY</span>

          <h2>
            Every piece
            <br />
            tells a story.
          </h2>

          <p>
            We believe jewelry should feel personal. Something you reach for every
            morning, something you wear when celebrating, something that quietly
            becomes part of who you are.
          </p>

          <Link to="/about" className="text-link">
            Discover our story →
          </Link>
        </motion.div>
      </section>

      <section className="gift-section">
        <motion.div
          className="gift-content"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <span className="eyebrow">FOR SOMEONE SPECIAL</span>

          <h2>
            A little something
            <br />
            to remember.
          </h2>

          <p>
            Discover delicate pieces made for birthdays, celebrations and all the
            moments worth remembering.
          </p>

          <Link to="/shop" className="button button-dark">
            Explore gifting
          </Link>
        </motion.div>
      </section>

      <section className="instagram section-padding">
        <SectionTitle
          eyebrow="@LUNEA.JEWELRY"
          title="Follow our story"
          description="Discover more pieces, styling ideas and moments from our community."
        />

        <div className="instagram-grid">
          {[
            'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=85',
            'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=700&q=85',
            'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=700&q=85',
            'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=700&q=85',
          ].map((image, index) => (
            <motion.a
              href="#"
              key={index}
              className="instagram-item"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <img src={image} alt="Lunéa Instagram" />
            </motion.a>
          ))}
        </div>
      </section>
    </main>
  )
}

function Collection({ number, title, image }) {
  return (
    <motion.div
      className="collection-card"
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
        <Link to="/shop">
          Explore <span>↗</span>
        </Link>
      </div>
    </motion.div>
  )
}

export default Home
