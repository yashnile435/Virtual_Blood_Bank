import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

const BloodBankLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = -((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * 10;
        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

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
                navigate('/bloodbank-dashboard');
            }
        } catch (err) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden font-sans">
            {/* 3D Tilt Card Container */}
            <div
                className="w-full max-w-md transform-style-3d transition-transform duration-200 ease-out"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                }}
            >
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden group">
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-100/50 to-transparent translate-x-[-150%] skew-x-[-25deg] group-hover:animate-shine transition-all duration-1000 pointer-events-none"></div>

                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center mb-4">
                            <img src="/logo.png" alt="VBBS Logo" className="h-20 w-auto object-contain" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blood Bank Login</h1>
                        <p className="text-gray-500 mt-2 text-sm">Access your blood inventory dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
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
                            <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
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
                            <Link to="/signup" className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium">
                                Register New Bank
                            </Link>
                            <button type="button" className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-200 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-gray-400 relative z-10">
                        <p>&copy; 2026 VBBS System. Secure Access Only.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodBankLogin;
