
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home"
import BloodBankLogin from "./pages/BloodBankLogin"
import BloodBankSignup from "./pages/BloodBankSignup"
import BloodBankDashboard from "./pages/BloodBankDashboard"
import UserSignup from "./pages/UserSignup"
import UserLogin from "./pages/UserLogin"
import UserDashboard from "./pages/UserDashboard"
import AdminLogin from "./pages/AdminLogin"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Blood Bank Routes */}
        <Route path="/bloodbank-login" element={<BloodBankLogin />} />
        <Route path="/signup" element={<BloodBankSignup />} />
        <Route path="/bloodbank-dashboard" element={<BloodBankDashboard />} />

        {/* User Routes */}
        <Route path="/user-signup" element={<UserSignup />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App 
