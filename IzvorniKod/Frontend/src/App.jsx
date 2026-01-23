// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import HomePage from "./pages/Homepage";
import Header from "./shared_components/Header";
import { CalendarPage } from "./pages/CalendarPage";
import  ChatWidget from "./components/chat/ChatWidget";
import { ChatProvider } from "./components/chat/ChatContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  const hasStoredUser = localStorage.getItem("user");
  return user || hasStoredUser ? children : <Navigate to="/login" />;
}

export default function App() {

   const walk = {
    walkId: "walk-1",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "EUR",
        intent: "capture"
      }}
    >
    <AuthProvider>
      <ChatProvider walk={walk}>
      <Header />
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
      </Routes>
      </ChatProvider>
    </AuthProvider>
  </PayPalScriptProvider>
  );
}
