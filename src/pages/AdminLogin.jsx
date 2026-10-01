import { useState } from "react";
import "../styles/admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("adminToken", data.token);
      setSuccess("You're signed in. Your admin session is ready.");
    } catch (error) {
      setError(error.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-showcase" aria-label="LUNÉA administration">
        <div className="admin-login-showcase-inner">
          <a className="admin-login-brand" href="/" aria-label="LUNÉA home">
            LUNÉA<span> ATELIER</span>
          </a>
          <div className="admin-login-art" aria-hidden="true">
            <div className="admin-login-orbit admin-login-orbit-one" />
            <div className="admin-login-orbit admin-login-orbit-two" />
            <div className="admin-login-gem">L</div>
            <span className="admin-login-spark admin-login-spark-one">✦</span>
            <span className="admin-login-spark admin-login-spark-two">✧</span>
          </div>
          <div className="admin-login-showcase-copy">
            <span className="admin-login-overline">THE HOUSE OF LUNÉA</span>
            <h1>Every detail,<br /><em>beautifully</em> considered.</h1>
            <p>A quiet space to care for the pieces and people that make our atelier.</p>
          </div>
          <span className="admin-login-edition">EST. WITH INTENTION · ALGIERS</span>
        </div>
      </section>

      <section className="admin-login-panel">
        <div className="admin-login-form-wrap">
          <div className="admin-login-mobile-brand">LUNÉA <span>ATELIER</span></div>
          <div className="admin-login-heading">
            <span className="admin-login-overline">ADMINISTRATION</span>
            <h2>Welcome back</h2>
            <p>Sign in with your administrator account to continue.</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <label htmlFor="admin-email">Email address</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@lunea.com"
                required
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p className="admin-login-message admin-login-error" role="alert">{error}</p>}
            {success && <p className="admin-login-message admin-login-success" role="status">{success}</p>}

            <button className="admin-login-submit" type="submit" disabled={loading}>
              <span>{loading ? "Signing in…" : "Sign in to your account"}</span>
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </form>

          <div className="admin-login-security">
            <span className="admin-login-lock" aria-hidden="true">◆</span>
            <span>Private access for authorized LUNÉA team members</span>
          </div>
          <a className="admin-login-back" href="/">← Back to the LUNÉA store</a>
        </div>
        <footer className="admin-login-footer">© {new Date().getFullYear()} LUNÉA ATELIER</footer>
      </section>
    </main>
  );
}
