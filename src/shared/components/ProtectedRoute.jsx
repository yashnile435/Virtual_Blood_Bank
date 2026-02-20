
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ProtectedRoute = ({ allowedRoles }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setUser(user);

            // Determine role by checking tables
            try {
                // 1. Check 'users' table
                let { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (userData) {
                    setRole(userData.role);
                } else {
                    // 2. Check 'blood_banks' table
                    let { data: bankData } = await supabase
                        .from('blood_banks')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (bankData) {
                        setRole(bankData.role);
                    } else {
                        // 3. Fallback for Admin (if manual entry or metadata)
                        // In this app, we might assume simple email check or let it pass if no role requirement strictness
                        // But for security, let's default to no role if not found.
                        // However, for Admin, we might rely on specific email if not in DB.
                        if (user.email === 'admin@bloodbank.com') {
                            setRole('ADMIN');
                        }
                    }
                }
            } catch (error) {
                console.error("Role check error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Access...</div>;

    if (!user) return <Navigate to="/" replace />;

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect based on role if possible, or just home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
