import React, { useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import ResetPassword from "./components/ResetPassword";
import "./styles.css";

const App = () => {
  const [user, setUser] = useState(() => {
    const session = JSON.parse(localStorage.getItem("session"));
    if (session && Date.now() < session.expiresAt) {
      return session.user;
    }
    return null;
  });

  // Auto-logout when session expires
  useEffect(() => {
    const checkSession = () => {
      const session = JSON.parse(localStorage.getItem("session"));
      if (session && Date.now() > session.expiresAt) {
        localStorage.removeItem("session");
        setUser(null);
      }
    };
    const interval = setInterval(checkSession, 1000 * 60); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Router basename="/calendar-webapp">
      <Routes>
        {/* Redirect to Dashboard if logged in, otherwise go to Login */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protect Dashboard Route */}
        <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
