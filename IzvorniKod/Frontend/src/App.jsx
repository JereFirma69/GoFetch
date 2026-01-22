// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPage from "./pages/AdminPage";
import SearchPage from "./pages/SearchPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import HomePage from "./pages/Homepage";
import Header from "./shared_components/Header";

import { CalendarPage } from "./pages/CalendarPage";
import  ChatWidget from "./components/chat/ChatWidget";
import { ChatProvider } from "./components/chat/ChatContext";
import { ReviewsProvider } from "./components/reviews/ReviewsContext";
import LeaveReviewModal from "./components/reviews/LeaveReviewModal";

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  const hasStoredUser = localStorage.getItem("user");
  return user || hasStoredUser ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const stored = localStorage.getItem("user");
  const parsed = stored ? JSON.parse(stored) : null;
  const currentUser = user || parsed;
  return currentUser && currentUser.role === "admin" ? children : <Navigate to="/homepage" />;
}

export default function App() {

   const walk = {
    walkId: "walk-1",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  return (
    <AuthProvider>
      <ReviewsProvider>
      <ChatProvider walk={walk}>
      <Header />
      <LeaveReviewModal/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <>
              <ProfilePage />
              <ChatWidget walk={walk}/>
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/homepage"
          element={
            <PrivateRoute>
              <>
              <HomePage />
              <ChatWidget walk = {walk}></ChatWidget>
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <SearchPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <MyBookingsPage />
            </PrivateRoute>
          }
        />
      </Routes>
      </ChatProvider>
      </ReviewsProvider>
    </AuthProvider>

  );
}
