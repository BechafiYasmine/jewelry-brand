function Contact() {
  return (
    <main className="contact-page">
      <section className="page-header">
        <span className="eyebrow">GET IN TOUCH</span>

        <h1>We'd love to hear from you.</h1>

        <p>
          Questions about a piece, an order or gifting? We're here to help.
        </p>
      </section>

      <section className="contact-grid">
        <div className="contact-card">
          <span className="eyebrow">INSTAGRAM</span>

          <h2>@lunea.jewelry</h2>

          <a href="#" className="text-link">
            Visit Instagram →
          </a>
        </div>

        <div className="contact-card">
          <span className="eyebrow">WHATSAPP</span>

          <h2>Let's talk</h2>

          <a href="#" className="text-link">
            Send us a message →
          </a>
        </div>

        <div className="contact-card">
          <span className="eyebrow">EMAIL</span>

          <h2>hello@lunea.com</h2>

          <a href="mailto:hello@lunea.com" className="text-link">
            Send an email →
          </a>
        </div>
      </section>
    </main>
  )
}

export default Contact
