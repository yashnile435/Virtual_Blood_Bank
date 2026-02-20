import React, { useEffect, useState } from 'react';
import axios from '../../services/api';
import { FaHandHoldingHeart, FaHistory, FaCalendarCheck } from 'react-icons/fa';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [recentRequests, setRecentRequests] = useState([]);
    const [stats, setStats] = useState({ donations: 0, pending: 0, available: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser && storedUser.id) {
                    // Fetch profile
                    const res = await axios.get(`/donors/id/${storedUser.id}`);
                    setUser(res.data);
                    setStats(prev => ({ ...prev, available: res.data.available }));

                    // Fetch requests (mocked filtering for now as backend might not filter by user)
                    const reqRes = await axios.get('/requests');
                    const myRequests = reqRes.data.filter(r => r.patientName === res.data.name || r.id % 2 === 0); // Mock logic for demo
                    setRecentRequests(myRequests.slice(0, 5));
                    setStats(prev => ({ ...prev, pending: myRequests.filter(r => r.status === 'PENDING').length }));
                }
            } catch (error) {
                console.error("Error fetching user data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-full text-red-600 font-bold">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-red-500 to-red-400 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-3xl font-bold mb-2">Welcome Back, {user?.name || 'Donor'}! 👋</h2>
                <p className="opacity-90">Thank you for being a hero. Your contributions save lives.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-500 text-xl">
                            <FaHandHoldingHeart />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.donations}</span>
                    </div>
                    <h3 className="text-gray-500 font-medium">Total Donations</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-3 bg-yellow-50 rounded-xl text-yellow-500 text-xl">
                            <FaHistory />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
                    </div>
                    <h3 className="text-gray-500 font-medium">Pending Requests</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                        <div className={`p-3 rounded-xl text-xl ${stats.available ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                            <FaCalendarCheck />
                        </div>
                        <span className={`text-lg font-bold ${stats.available ? 'text-green-600' : 'text-gray-400'}`}>
                            {stats.available ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                    <h3 className="text-gray-500 font-medium">Current Status</h3>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                {recentRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                    <th className="pb-4 font-medium">Patient</th>
                                    <th className="pb-4 font-medium">Hospital</th>
                                    <th className="pb-4 font-medium">Type</th>
                                    <th className="pb-4 font-medium">Date</th>
                                    <th className="pb-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentRequests.map(req => (
                                    <tr key={req.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 text-gray-800 font-medium">{req.patientName}</td>
                                        <td className="py-4 text-gray-600">{req.hospitalName}</td>
                                        <td className="py-4"><span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">{req.bloodGroup}</span></td>
                                        <td className="py-4 text-gray-500 text-sm">{new Date(req.requestDate).toLocaleDateString()}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">No recent activity found.</div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
