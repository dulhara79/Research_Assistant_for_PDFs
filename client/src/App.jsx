import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Chat from "./pages/Chat";
import VerifyOTP from "./pages/VerifyOTP";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <AuthProvider>
              <Login />
            </AuthProvider>
          }
        />
        <Route
          path="/register"
          element={
            <AuthProvider>
              <Register />
            </AuthProvider>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <AuthProvider>
              <VerifyOTP />
            </AuthProvider>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/chat"
          element={
            <AuthProvider>
              <Chat />
            </AuthProvider>
          }
        />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
