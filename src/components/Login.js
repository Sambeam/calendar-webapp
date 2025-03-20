import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (storedUser && storedUser.email === email) {
      // Compare entered password with stored hashed password
      const passwordMatch = await bcrypt.compare(password, storedUser.password);
      
      if (passwordMatch) {
        setUser(storedUser);
        navigate("/dashboard");
      } else {
        alert("Invalid email or password");
      }
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Login</h2>
        <form className="mt-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 mt-4 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/signup" className="text-blue-600 hover:underline">Don't have an account? Sign Up</Link>
        </div>
        <div className="mt-2 text-center">
          <Link to="/forgot-password" className="text-gray-500 hover:underline">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
