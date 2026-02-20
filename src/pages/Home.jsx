import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, User, ShieldCheck } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <div className="inline-flex items-center justify-center mb-6">
                    <img src="/logo.png" alt="VBBS Logo" className="h-24 w-auto object-contain drop-shadow-md" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                    Virtual Blood Bank System
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Connecting donors, patients, and blood banks in a unified platform for rapid emergency response.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                {/* Blood Bank Card */}
                <div className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                    <div className="p-8">
                        <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Blood Bank</h2>
                        <p className="text-gray-500 mb-8 min-h-[48px]">
                            Manage inventory, process requests, and update stock levels.
                        </p>
                        <div className="space-y-3">
                            <Link
                                to="/bloodbank/login"
                                className="block w-full text-center py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                Login as Bank
                            </Link>
                            <Link
                                to="/bloodbank/signup"
                                className="block w-full text-center py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                                Register New Bank
                            </Link>
                        </div>
                    </div>
                </div>

                {/* User Card */}
                <div className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                    <div className="p-8">
                        <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                            <User className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Patient / User</h2>
                        <p className="text-gray-500 mb-8 min-h-[48px]">
                            Search availability, request blood units, and track status.
                        </p>
                        <div className="space-y-3">
                            <Link
                                to="/user/login"
                                className="block w-full text-center py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                Login as Patient
                            </Link>
                            <Link
                                to="/user/signup"
                                className="block w-full text-center py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Admin Card */}
                <div className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gray-800"></div>
                    <div className="p-8">
                        <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-700 group-hover:scale-110 transition-transform duration-300">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Administrator</h2>
                        <p className="text-gray-500 mb-8 min-h-[48px]">
                            System oversight, manage banks, and monitor platform activity.
                        </p>
                        <div className="space-y-3">
                            <Link
                                to="/admin/login"
                                className="block w-full text-center py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200"
                            >
                                Admin Access
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Virtual Blood Bank Management System
            </div>
        </div>
    );
};

export default Home;
