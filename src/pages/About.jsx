import { Link } from 'react-router-dom'

function About() {
  return (
    <main className="about-page">
      <section className="page-header">
        <span className="eyebrow">OUR STORY</span>

        <h1>Made to become yours.</h1>

        <p>
          Jewelry that feels personal, timeless and effortlessly beautiful.
        </p>
      </section>

      <section className="about-intro">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85"
            alt="Jewelry"
          />
        </div>

        <div className="about-text">
          <span className="eyebrow">THE LUNÉA PHILOSOPHY</span>

          <h2>
            Beauty doesn't
            <br />
            need to be loud.
          </h2>

          <p>
            Lunéa was created around a simple idea: jewelry can be delicate and still
            make a statement.
          </p>

          <p>
            Each piece is chosen with intention, with an appreciation for simplicity,
            femininity and timeless design.
          </p>
        </div>
      </section>

      <section className="about-values">
        <div>
          <span>01</span>
          <h3>Timeless</h3>
          <p>Pieces designed to stay beautiful beyond trends.</p>
        </div>

        <div>
          <span>02</span>
          <h3>Delicate</h3>
          <p>Soft details that add elegance without overwhelming.</p>
        </div>

        <div>
          <span>03</span>
          <h3>Personal</h3>
          <p>Jewelry that becomes part of your own story.</p>
        </div>
      </section>

      <section className="about-cta">
        <h2>
          Find something
          <br />
          that feels like you.
        </h2>

        <Link to="/shop" className="button button-dark">
          Explore the collection
        </Link>
      </section>
    </main>
  )
}

export default About
