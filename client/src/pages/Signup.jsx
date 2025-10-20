import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlusIcon } from "@heroicons/react/24/solid"; // npm install @heroicons/react

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signup = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        navigate("/");
      } else {
        alert("Signup failed. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <UserPlusIcon className="h-12 w-12 text-rose-500 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
          <p className="text-gray-500 text-sm">Join us and get started today</p>
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* Sign Up Button */}
        <button
          onClick={signup}
          className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-lg w-full transition"
        >
          Sign Up
        </button>

        {/* Login Link */}
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-rose-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
