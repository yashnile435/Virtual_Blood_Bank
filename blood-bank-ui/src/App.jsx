import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import UserRequests from './pages/user/BloodRequests';
import DonorAvailability from './pages/user/DonorAvailability';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Admin Route (Check role)
const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.role?.includes('ADMIN')) {
        return <Navigate to="/user/dashboard" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Admin Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <AdminRoute>
                                    <Dashboard />
                                </AdminRoute>
                            </ProtectedRoute>
                        }
                    />

                    {/* User Routes - Wrapped in UserLayout */}
                    <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="profile" element={<UserProfile />} />
                        <Route path="requests" element={<UserRequests />} />
                        <Route path="availability" element={<DonorAvailability />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
