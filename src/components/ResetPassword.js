import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
      navigate("/login");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Reset Password</h2>
        <form className="mt-4" onSubmit={handleReset}>
          <label className="block text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 mt-4 rounded-md hover:bg-blue-700">Send Reset Link</button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
