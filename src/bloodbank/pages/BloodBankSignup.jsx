import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

const BloodBankSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { name, email, password, city, address, phone } = formData;

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into blood_banks table
        const { error: dbError } = await supabase.from("blood_banks").insert([
          {
            id: authData.user.id,
            name,
            email,
            city,
            address,
            phone,
            role: "BLOOD_BANK",
            created_at: new Date().toISOString(),
          },
        ]);

        if (dbError) throw dbError;

        setSuccess("Registration successful! Redirecting to login...");

        setTimeout(() => {
          navigate("/bloodbank/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-red-600 p-6 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white mb-4 shadow-md">
            <img
              src="/logo.png"
              alt="VBBS Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold">Register Blood Bank</h2>
          <p className="text-red-100 text-sm mt-1">
            Join the network to save lives
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg text-sm">
              <p className="font-bold">Success</p>
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Blood Bank Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="Red Cross Center"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="contact@redcross.com"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                placeholder="123 Medical Drive, Suite 100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                placeholder="New York"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
            >
              {loading ? "Creating Account..." : "Register Blood Bank"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/bloodbank/login"
                className="text-red-600 hover:text-red-700 font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodBankSignup;
