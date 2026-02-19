
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Activity,
    Droplet,
    Clock,
    CheckCircle,
    XCircle,
    LogOut,
    Menu,
    X,
    TrendingUp,
    PieChart,
    Search,
    Edit2,
    Trash2,
    Shield
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRequests: 0,
        approvedRequests: 0,
        pendingRequests: 0,
        totalUnitsUsed: 0,
        activeBloodBanks: 0
    });
    const [chartData, setChartData] = useState({
        bloodTypeData: [],
        monthlyData: [],
        statusData: []
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, banks

    // Management State
    const [users, setUsers] = useState([]);
    const [bloodBanks, setBloodBanks] = useState([]);
    const [manageLoading, setManageLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, suspended

    useEffect(() => {
        checkAdmin();
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'banks') fetchBloodBanks();
    }, [activeTab]);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/admin-login');
            return;
        }

        const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!adminData) {
            navigate('/');
        }
    };

    const fetchData = async () => {
        // ... (Existing fetchData logic preserved)
        setLoading(true);
        try {
            const { data: requests, error: requestsError } = await supabase
                .from('blood_requests')
                .select('*');

            if (requestsError) throw requestsError;

            const { count: banksCount, error: banksError } = await supabase
                .from('blood_banks')
                .select('*', { count: 'exact', head: true });

            if (banksError) throw banksError;

            const totalRequests = requests.length;
            const approvedRequests = requests.filter(r => r.status === 'APPROVED').length;
            const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
            const totalUnitsUsed = requests
                .filter(r => r.status === 'APPROVED')
                .reduce((sum, r) => sum + (r.quantity || 1), 0);

            setStats({
                totalRequests,
                approvedRequests,
                pendingRequests,
                totalUnitsUsed,
                activeBloodBanks: banksCount || 0
            });

            // 1. Blood Type Distribution
            const bloodTypeCount = {};
            requests.forEach(r => {
                bloodTypeCount[r.blood_group] = (bloodTypeCount[r.blood_group] || 0) + (r.quantity || 1);
            });
            const bloodTypeData = Object.keys(bloodTypeCount).map(type => ({
                name: type,
                units: bloodTypeCount[type]
            }));

            // 2. Monthly Trend
            const monthlyCount = {};
            requests.forEach(r => {
                const date = new Date(r.created_at);
                const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                if (r.status === 'APPROVED') {
                    monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + (r.quantity || 1);
                }
            });
            const monthlyData = Object.keys(monthlyCount).map(key => ({
                name: key,
                units: monthlyCount[key]
            }));

            // 3. Status Distribution
            const statusCount = {
                APPROVED: approvedRequests,
                PENDING: pendingRequests,
                REJECTED: requests.filter(r => r.status === 'REJECTED').length
            };
            const statusData = Object.keys(statusCount).map(key => ({
                name: key,
                value: statusCount[key]
            }));

            setChartData({
                bloodTypeData,
                monthlyData,
                statusData
            });

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setManageLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setUsers(data);
        setManageLoading(false);
    };

    const fetchBloodBanks = async () => {
        setManageLoading(true);
        // Fetch banks with inventory summary
        const { data, error } = await supabase
            .from('blood_banks')
            .select(`
                *,
                blood_inventory (quantity)
            `)
            .order('created_at', { ascending: false });

        if (data) {
            const processed = data.map(bank => ({
                ...bank,
                totalStock: bank.blood_inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0
            }));
            setBloodBanks(processed);
        }
        setManageLoading(false);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const { error } = await supabase
            .from('users')
            .update({ is_active: !currentStatus })
            .eq('id', userId);

        if (!error) fetchUsers();
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure? This will delete the user and their request history.")) return;

        // 1. Delete requests first (due to potential foreign keys, though ON DELETE CASCADE might handle it)
        await supabase.from('blood_requests').delete().eq('user_id', userId);

        // 2. Delete user profile
        const { error } = await supabase.from('users').delete().eq('id', userId);

        if (!error) fetchUsers();
        else alert("Failed to delete user: " + error.message);
    };

    const toggleBankStatus = async (bankId, currentStatus) => {
        const { error } = await supabase
            .from('blood_banks')
            .update({ is_active: !currentStatus })
            .eq('id', bankId);

        if (!error) fetchBloodBanks();
    };

    const deleteBank = async (bankId) => {
        if (!window.confirm("Are you sure? This will delete the blood bank, inventory, and all associated requests.")) return;

        await supabase.from('blood_inventory').delete().eq('blood_bank_id', bankId);
        await supabase.from('blood_requests').delete().eq('blood_bank_id', bankId);
        const { error } = await supabase.from('blood_banks').delete().eq('id', bankId);

        if (!error) fetchBloodBanks();
        else alert("Failed to delete blood bank: " + error.message);
    };


    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin-login');
    };

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </div>
    );

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#ef4444', '#3b82f6'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="h-10 w-10 text-red-600 animate-pulse" />
                    <p className="text-gray-500 font-medium">Loading Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="h-6 w-6 text-red-600" />
                            Admin Panel
                        </h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-red-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <button
                            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${activeTab === 'users' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Users className="h-5 w-5" />
                            Manage Users
                        </button>
                        <button
                            onClick={() => { setActiveTab('banks'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all ${activeTab === 'banks' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Activity className="h-5 w-5" />
                            Blood Banks
                        </button>
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-red-600">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">
                                {activeTab === 'overview' && 'System Overview'}
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'banks' && 'Blood Bank Management'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">A</div>
                    </div>
                </header>

                <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Requests" value={stats.totalRequests} icon={Activity} color="bg-blue-500 text-blue-500" subtext="All time received" />
                                <StatCard title="Approved Requests" value={stats.approvedRequests} icon={CheckCircle} color="bg-green-500 text-green-500" subtext="Successfully processed" />
                                <StatCard title="Pending Requests" value={stats.pendingRequests} icon={Clock} color="bg-yellow-500 text-yellow-500" subtext="Awaiting action" />
                                <StatCard title="Total Units Used" value={stats.totalUnitsUsed} icon={Droplet} color="bg-red-500 text-red-500" subtext="Blood units distributed" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-red-600" />
                                        Most Requested Blood Types
                                    </h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData.bloodTypeData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: '#fef2f2' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Bar dataKey="units" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        Monthly Usage Trend
                                    </h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData.monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                <YAxis axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Line type="monotone" dataKey="units" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 outline-none w-full sm:w-64"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.filter(u =>
                                            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            u.email.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                    <div className="text-xs text-gray-400">{user.city} • {user.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {user.is_active ? 'ACTIVE' : 'SUSPENDED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                        className={`p-2 rounded-lg transition-colors ${user.is_active ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                        title={user.is_active ? "Suspend User" : "Activate User"}
                                                    >
                                                        <Activity className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* BLOOD BANKS TAB */}
                    {activeTab === 'banks' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search blood banks..."
                                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-100 outline-none w-full sm:w-64"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                            <th className="px-6 py-4">Blood Bank</th>
                                            <th className="px-6 py-4">Details</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bloodBanks.filter(b =>
                                            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            b.city.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map(bank => (
                                            <tr key={bank.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{bank.name}</div>
                                                    <div className="text-sm text-gray-500">{bank.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div>{bank.city}</div>
                                                    <div className="text-xs">{bank.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                        {bank.totalStock} Units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bank.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {bank.is_active ? 'ACTIVE' : 'SUSPENDED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => toggleBankStatus(bank.id, bank.is_active)}
                                                        className={`p-2 rounded-lg transition-colors ${bank.is_active ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                        title={bank.is_active ? "Suspend Bank" : "Activate Bank"}
                                                    >
                                                        <Activity className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteBank(bank.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete Bank"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
