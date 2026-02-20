import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

const BloodBankLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        navigate("/bloodbank/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md transition-all duration-200">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img
                src="/logo.png"
                alt="VBBS Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Blood Bank Login
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Access your blood inventory dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 outline-none bg-gray-50 focus:bg-white"
                placeholder="admin@bloodbank.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 outline-none bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                to="/bloodbank/signup"
                className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
              >
                Register New Bank
              </Link>
              <button
                type="button"
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400">
            <p>&copy; 2026 VBBS System. Secure Access Only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodBankLogin;
