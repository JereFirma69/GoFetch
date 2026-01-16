import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
import { AuthContext } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

function SignupPage() {
  const navigate = useNavigate();
  const { signup, loading, error, googleLogin } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");


  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSignup(e) {
    e.preventDefault();
    setFormError("");
    const { firstName, lastName, email, password, confirmPassword } = formData;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setFormError("Sva polja su obavezna.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Lozinke se ne podudaraju.");
      return;
    }
    const ok = await signup(firstName, lastName, email, password);
    if (ok) navigate("/homepage");
  }

  return (
    <div className="authorisation-container">
      <div className="gf-title">
        <h2>GoFetch!</h2>
        <img className="logo-img" src={logoImg} alt="Logo" />
      </div>

  <GoogleSignInButton text="signup_with" />

      <p>ili</p>

      <form onSubmit={handleSignup}>
        {(formError || error) && <p className="form-error">{formError || error}</p>}
        <input
          type="text"
          placeholder="Ime"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Prezime"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="E-mail"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Lozinka"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Potvrdi lozinku"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <div className="button-container">
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Registracija..." : "Registriraj se"}
          </button>
        </div>
      </form>

      <p>
        Već imaš račun? <Link to="/login">Prijava</Link>
      </p>
    </div>
  );
}

export default SignupPage;
