
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
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
  <input
    type="email"
    placeholder="E-mail"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
  />
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
  />
  <button
    type="submit"
    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-medium"
  >
    Log In
  </button>
</form>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">


      <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </div>
  );
}

export default LoginPage;
