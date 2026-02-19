
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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

            if (data.user) {
                // Check if user is in admins table
                const { data: adminData } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (adminData) {
                    navigate('/admin-dashboard');
                } else {
                    // Try to insert if missing (auto-fix for dev)
                    const { error: insertError } = await supabase
                        .from('admins')
                        .insert([{ id: data.user.id, email: email, role: 'ADMIN' }]);

                    if (!insertError) {
                        navigate('/admin-dashboard');
                    } else {
                        throw new Error("Unauthorized: You are not an admin.");
                    }
                }
            }
        } catch (err) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-red-600 p-6 text-center border-b border-red-500 relative">

                    <h2 className="text-2xl font-bold tracking-wider text-white">ADMIN CONTROL</h2>
                    <p className="text-red-100 text-xs uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">System ID</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
                                placeholder="admin@system.local"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Access Key</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 mt-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide shadow-md hover:shadow-lg transition-all transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-wide"
                        >
                            Login Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
