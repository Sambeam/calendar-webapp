import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const SignUp = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      localStorage.setItem("session", JSON.stringify({
        user: userCredential.user,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }));
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Sign Up</h2>
        <form className="mt-4" onSubmit={handleSignUp}>
          <label className="block text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="block mt-4 text-gray-700 dark:text-gray-300">Password</label>
          <input type="password" className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-green-600 text-white p-2 mt-4 rounded-md hover:bg-green-700">Sign Up</button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
