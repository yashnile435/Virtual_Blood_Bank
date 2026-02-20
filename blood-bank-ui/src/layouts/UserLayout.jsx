import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <div className="w-64 hidden md:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Top stats or header could go here */}
                <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm md:hidden">
                    {/* Mobile Header */}
                    <span className="font-bold text-red-600 text-xl">VBBS</span>
                    {/* Add hamburger menu here if needed */}
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
