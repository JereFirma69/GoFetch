import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function login(email, password) {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      const userObj = { 
        userId: data.userId, 
        email: data.email, 
        role: data.role, 
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName
      };
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

  async function signup(firstName, lastName, email, password) {
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/register", { firstName, lastName, email, password });
      const userObj = { 
        userId: data.userId, 
        email: data.email, 
        role: data.role, 
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName
      };
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
      const userObj = { 
        userId: data.userId, 
        email: data.email, 
        role: data.role, 
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName
      };
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

  async function logout() {
    try {
      await api.post("/auth/logout", {});
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
