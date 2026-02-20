import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaHeartbeat, FaCalendarCheck, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    const menuItems = [
        { path: '/user/dashboard', name: 'Dashboard', icon: <FaHome /> },
        { path: '/user/profile', name: 'My Profile', icon: <FaUser /> },
        { path: '/user/requests', name: 'Blood Requests', icon: <FaHeartbeat /> },
        { path: '/user/availability', name: 'Availability', icon: <FaCalendarCheck /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="h-screen w-64 bg-white shadow-xl flex flex-col fixed left-0 top-0 z-20 hidden md:flex">
            <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                    <span>❤️</span> VBBS
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                                ? 'bg-red-50 text-red-600 font-semibold shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-red-500'
                            }`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
