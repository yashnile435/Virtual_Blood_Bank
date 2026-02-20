
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./pages/Home"

// Shared Components
import ProtectedRoute from './shared/components/ProtectedRoute';

// Admin
import AdminLogin from "./admin/pages/AdminLogin"
import AdminDashboard from "./admin/pages/AdminDashboard"

// Blood Bank
import BloodBankLogin from "./bloodbank/pages/BloodBankLogin"
import BloodBankSignup from "./bloodbank/pages/BloodBankSignup"
import BloodBankDashboard from "./bloodbank/pages/BloodBankDashboard"

// User
import UserSignup from "./user/pages/UserSignup"
import UserLogin from "./user/pages/UserLogin"
import UserDashboard from "./user/pages/UserDashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Blood Bank Routes */}
        <Route path="/bloodbank/login" element={<BloodBankLogin />} />
        <Route path="/bloodbank/signup" element={<BloodBankSignup />} />
        <Route element={<ProtectedRoute allowedRoles={['BLOOD_BANK']} />}>
          <Route path="/bloodbank/dashboard" element={<BloodBankDashboard />} />
        </Route>

        {/* User Routes */}
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>

        {/* Fallback for old routes or 404 */}
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/bloodbank-login" element={<Navigate to="/bloodbank/login" replace />} />
        <Route path="/user-login" element={<Navigate to="/user/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
