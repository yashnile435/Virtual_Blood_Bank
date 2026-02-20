import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-shadow">
            <div className="container nav-container">
                <Link to="/" className="logo">
                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>❤️</span>
                    <span>Virtual Blood Bank</span>
                </Link>

                <div className="nav-links">
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                            <NavLink to="/inventory" className="nav-link">Inventory</NavLink>
                            <NavLink to="/donors" className="nav-link">Donors</NavLink>
                            <NavLink to="/requests" className="nav-link">Requests</NavLink>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '1rem', padding: '0.4rem 1rem' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" className="btn btn-primary">
                            Login
                        </NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
