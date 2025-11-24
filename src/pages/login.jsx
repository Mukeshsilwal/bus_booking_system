import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import API_CONFIG from "../config/api";
import apiService from "../services/api.service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  async function handleLogin() {
    // basic validation
    const trimmedEmail = (email || "").trim();
    if (!trimmedEmail) return toast.error("Please enter your email");
    // simple email regex
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmedEmail)) return toast.error("Please enter a valid email");

    if (!password || password.length < 4) return toast.error("Please enter your password");

    setIsLoading(true);
    try {
      const loginRes = await apiService.post(API_CONFIG.ENDPOINTS.LOGIN, {
        email: trimmedEmail,
        password,
      });

      if (loginRes && loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}));
        const token = data.token;
        if (token) localStorage.setItem("token", token);

        setEmail("");
        setPassword("");

        toast.success("Login successful!");
        navigate("/admin/panel", { replace: true });
      } else {
        const err = loginRes ? await loginRes.json().catch(() => ({})) : {};
        const msg = err.message || "Invalid email or password";
        toast.error(msg);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 transform transition duration-500 hover:shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-indigo-700 mb-6">
          Welcome Back
        </h1>

        <p className="text-center text-sm text-gray-600 mb-6">Sign in to manage bookings and access the admin panel.</p>

        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              autoComplete="off"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              autoFocus
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-300"
              aria-label="email"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-300"
                aria-label="password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Signing in...' : 'Log In'}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <Link to="/change-password" className="text-indigo-600 font-medium hover:underline">
            Forgot password?
          </Link>
          <p>
            New here?{' '}
            <Link to="/admin/register" className="text-indigo-600 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
