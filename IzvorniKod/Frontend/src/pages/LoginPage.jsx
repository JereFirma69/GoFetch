
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../context/AuthContext";
import logoImg from "../assets/logo.png";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    if (login(email, password)) navigate("/homepage");
    else alert("Pogrešan email ili lozinka");
  }

  return (
    <div className="authorisation-container">
      <div className="gf-title">
        <img className="logo-img" src={logoImg} alt="Logo" />
      </div>

      <button className="google-btn">
        <FcGoogle className="google-icon" /> Continue with Google
      </button>

      <p>or</p>

      <form onSubmit={handleLogin}>
        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="primary-btn">Log In</button>
      </form>

      <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </div>
  );
}

export default LoginPage;
