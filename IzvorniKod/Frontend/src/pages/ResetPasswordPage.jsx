import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import logoImg from "../assets/logo.png";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Nevažeći link za resetiranje lozinke.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Lozinke se ne podudaraju");
      return;
    }

    if (newPassword.length < 6) {
      setError("Lozinka mora biti najmanje 6 znakova");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/reset-password", { 
        token, 
        newPassword 
      });
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(response.message || "Failed to reset password");
      }
    } catch (e) {
      setError(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authorisation-container">
      <div className="gf-title">
        <img className="logo-img" src={logoImg} alt="Logo" />
      </div>

      <h2>Resetiraj lozinku</h2>

      {success ? (
        <div className="success-message">
          <p>Lozinka uspješno resetirana! Preusmjeravam na prijavu...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error">{error}</p>}
          <input
            type="password"
            placeholder="Nova lozinka"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
            disabled={!token}
          />
          <input
            type="password"
            placeholder="Potvrdi novu lozinku"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            disabled={!token}
          />
          <button type="submit" className="primary-btn" disabled={loading || !token}>
            {loading ? "Resetiranje..." : "Resetiraj lozinku"}
          </button>
        </form>
      )}

      <p>
        <Link to="/login">← Povratak na prijavu</Link>
      </p>
    </div>
  );
}

export default ResetPasswordPage;
