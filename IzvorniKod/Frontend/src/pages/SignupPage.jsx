import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import logoImg from "../assets/logo.png";

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSignup(e) {
    e.preventDefault();
    const user = { username, email, password };
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");
    navigate("/homepage");
  }

  return (
    <div className="authorisation-container">
      <div className="gf-title">
        <h2>GoFetch!</h2>
        <img className="logo-img" src={logoImg} alt="Logo" />
      </div>

      {/* Google button */}
      <button className="google-btn">
        <FcGoogle className="google-icon" /> Continue with Google
      </button>

      <p>or</p>

      {/* Signup form */}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* dugme unutar forme */}
        <div className="button-container">
          <button type="submit" className="primary-btn">
            Sign Up
          </button>
        </div>
      </form>

      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}

export default SignupPage;
