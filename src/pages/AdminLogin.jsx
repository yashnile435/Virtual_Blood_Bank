import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

            // Ideally verify role is ADMIN here
            if (data.user) {
                // navigate('/admin-dashboard'); // To be implemented
                alert("Admin Login Successful! (Dashboard pending)");
            }
        } catch (err) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-white">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
                <div className="bg-red-900 p-6 text-center border-b border-red-800">
                    <h2 className="text-2xl font-bold tracking-wider">ADMIN CONTROL</h2>
                    <p className="text-red-200 text-xs uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">System ID</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white placeholder-gray-500 transition-all basic-input"
                                placeholder="admin@system.local"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Access Key</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white placeholder-gray-500 transition-all basic-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 mt-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide shadow-lg transition-all transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
