import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import logoImg from "../assets/logo.png";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (e) {
      setError(e.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authorisation-container">
      <div className="gf-title">
        <img className="logo-img" src={logoImg} alt="Logo" />
      </div>

      <h2>Zaboravljena lozinka</h2>
      <p>Unesi email adresu i poslat ćemo ti link za resetiranje lozinke.</p>

      {success ? (
        <div className="success-message">
          <p>Ako postoji račun s tom email adresom, poslat ćemo ti upute za resetiranje lozinke.</p>
          <Link to="/login" className="primary-btn">Povratak na prijavu</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Šaljem..." : "Pošalji link"}
          </button>
        </form>
      )}

      <p>
        <Link to="/login">← Povratak na prijavu</Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
