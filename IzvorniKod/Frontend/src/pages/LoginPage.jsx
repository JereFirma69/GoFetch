
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logoImg from "../assets/logo.png";
import GoogleSignInButton from "../components/GoogleSignInButton";

function LoginPage() {
  const { login, loading, error, googleLogin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setFormError("");
    if (!email || !password) {
      setFormError("Unesi email i lozinku.");
      return;
    }
    const ok = await login(email, password);
    if (ok) navigate("/homepage");
  }

  return (
    <div className="authorisation-container">
      <div className="gf-title">
        <img className="logo-img" src={logoImg} alt="Logo" />
      </div>

      <GoogleSignInButton text="signin_with" />

      <p>ili</p>

      <form onSubmit={handleLogin}>
        {(formError || error) && <p className="form-error">{formError || error}</p>}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Prijava..." : "Prijava"}
        </button>
      </form>

      <p>Nemaš račun? <Link to="/signup">Registracija</Link></p>
    </div>
  );
}

export default LoginPage;