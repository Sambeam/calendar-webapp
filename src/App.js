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
    return session && Date.now() < session.expiresAt ? session.user : null;
  });

  useEffect(() => {
    const checkSession = () => {
      const session = JSON.parse(localStorage.getItem("session"));
      if (session && Date.now() > session.expiresAt) {
        localStorage.removeItem("session");
        setUser(null);
      }
    };
    const interval = setInterval(checkSession, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>  {/* ✅ No `basename` needed */}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUp setUser={setUser} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
