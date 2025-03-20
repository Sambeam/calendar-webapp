import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.email !== email) {
      alert("No account found with this email.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in localStorage
    const updatedUser = { ...storedUser, password: hashedPassword };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Password reset successful! You can now log in with your new password.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Reset Password</h2>
        <form className="mt-4" onSubmit={handleResetPassword}>
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
            <label className="block text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 mt-1 border rounded-md dark:bg-gray-700 dark:text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 mt-4 rounded-md hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
