import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import logoImg from "../assets/logo.png";

// koristim ovdje lokacije da odredim koji header prikazati ovisno o stranici

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  function handleLogout() {
    logout();
    navigate("/");
  }

  // jednostavan header za login/signup stranice

  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password"
  ) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="GoFetch logo" className="h-8 w-8" />
            <span className="text-xl font-semibold text-gray-800">PawPal!</span>
          </Link>
          <nav className="flex gap-2">
            {location.pathname === "/login" ? (
              <Link
                to="/signup"
                className="px-4 py-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition"
              >
                Sign Up
              </Link>
            ) : location.pathname === "/signup" ? (
              <Link
                to="/login"
                className="px-4 py-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition"
              >
                Log In
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    );
  }

  // header za ulogiranog korisnika
  if (user) {
    const isAdmin = user.role === "admin";
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/homepage" className="flex items-center gap-2">
            <img src={logoImg} alt="PawPal logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-800">PawPal</span>
          </Link>

          <nav className="flex gap-2">
            <Link
              to="/homepage"
              className={`px-4 py-2 rounded-lg transition ${
                location.pathname === "/homepage"
                  ? "bg-teal-50 text-teal-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Home
            </Link>

            <Link
              to="/search"
              className={`px-4 py-2 rounded-lg transition ${
                location.pathname.startsWith("/search")
                  ? "bg-teal-50 text-teal-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Search
            </Link>

            <Link
              to="/my-bookings"
              className={`px-4 py-2 rounded-lg transition ${
                location.pathname === "/my-bookings"
                  ? "bg-teal-50 text-teal-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              My Bookings
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg transition ${
                  location.pathname === "/admin"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Admin
              </Link>
            )}

            <Link
              to="/profile"
              className={`px-4 py-2 rounded-lg transition ${
                location.pathname === "/profile"
                  ? "bg-teal-50 text-teal-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
    );
  }

  // fallback (ako nije ulogiran)
  return null;
}
