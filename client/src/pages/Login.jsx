import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/24/solid";

// ✅ DEFINE YOUR LIVE API URL HERE
const API_BASE_URL = "https://password-manager-app-t77e.onrender.com";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    // Add event parameter and preventDefault for form submission
    e.preventDefault();
    
    try {
      // ✅ Use the variable API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        navigate("/dashboard");
      } else {
        alert("Invalid username or password");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  const googleLogin = () => {
    // ✅ Use the variable API_BASE_URL
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <LockClosedIcon className="h-10 w-10 sm:h-12 sm:w-12 text-rose-500 mb-2" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm text-center">
            Please login to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={login}>
            {/* Email Input */}
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
            </label>
            <input
                type="email"
                placeholder="you@example.com"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // Added validation
            />
            </div>

            {/* Password Input */}
            <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
            </label>
            <input
                type="password"
                placeholder="••••••••"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // Added validation
            />
            </div>

            {/* Login Button */}
            <button
            type="submit"
            className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-lg w-full transition text-sm sm:text-base"
            >
            Login
            </button>
        </form>

        {/* Google Login */}
        <button
          type="button" // Prevent form submission
          onClick={googleLogin}
          className="bg-white text-gray-800 border border-gray-300 font-medium px-4 py-2 rounded-lg w-full mt-3 transition hover:bg-gray-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <img
            src="https://img.icons8.com/?size=100&id=V5cGWnc9R4xj&format=png&color=000000"
            alt="Google Logo"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          Continue with Google
        </button>

        {/* Sign Up Link */}
        <p className="mt-4 text-xs sm:text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-rose-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}