import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Restore session on load
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function login(email, password) {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      // { jwt, userId, email, role, displayName }
      localStorage.setItem("jwt", data.jwt);
      const userObj = { userId: data.userId, email: data.email, role: data.role, displayName: data.displayName };
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function signup(firstName, lastName, email, password, role = "owner") {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/register", { firstName, lastName, email, password });
      localStorage.setItem("jwt", data.jwt);
      // Immediately register chosen role on backend
      try {
        await api.post("/auth/register-role", { role });
      } catch (e) {
        // if role registration fails, still proceed but reflect chosen role locally
      }
      const userObj = { userId: data.userId, email: data.email, role: role || data.role, displayName: data.displayName };
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin(credential) {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/oauth-login", { provider: "google", token: credential });
      localStorage.setItem("jwt", data.jwt);
      const userObj = { userId: data.userId, email: data.email, role: data.role, displayName: data.displayName };
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
