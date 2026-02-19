
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
    PieChart
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

    useEffect(() => {
        checkAdmin();
        fetchData();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/admin-login');
            return;
        }

        const { data: adminData, error } = await supabase
            .from('admins')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !adminData) {
            navigate('/');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Blood Requests
            const { data: requests, error: requestsError } = await supabase
                .from('blood_requests')
                .select('*');

            if (requestsError) throw requestsError;

            // Fetch Blood Banks Count
            const { count: banksCount, error: banksError } = await supabase
                .from('blood_banks')
                .select('*', { count: 'exact', head: true });

            if (banksError) throw banksError;

            // Process Stats
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

            // Process Chart Data

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
                    <p className="text-gray-500 font-medium">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
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
                            <ShieldCheck className="h-6 w-6 text-red-600" />
                            Admin Panel
                        </h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-red-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl shadow-sm transition-all">
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                        </button>
                        {/* Placeholder for future links */}
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                            <Users className="h-5 w-5" />
                            Manage Users
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
                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-red-600">
                                <Menu className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Admin Analytics</h1>
                                <p className="text-xs text-gray-500">System Overview & Usage Statistics</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600 hidden sm:block">Administrator</span>
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Requests"
                            value={stats.totalRequests}
                            icon={Activity}
                            color="bg-blue-500 text-blue-500"
                            subtext="All time received"
                        />
                        <StatCard
                            title="Approved Requests"
                            value={stats.approvedRequests}
                            icon={CheckCircle}
                            color="bg-green-500 text-green-500"
                            subtext="Successfully processed"
                        />
                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                            icon={Clock}
                            color="bg-yellow-500 text-yellow-500"
                            subtext="Awaiting action"
                        />
                        <StatCard
                            title="Total Units Used"
                            value={stats.totalUnitsUsed}
                            icon={Droplet}
                            color="bg-red-500 text-red-500"
                            subtext="Blood units distributed"
                        />
                        <StatCard
                            title="Active Blood Banks"
                            value={stats.activeBloodBanks}
                            icon={Users}
                            color="bg-purple-500 text-purple-500"
                            subtext="Registered partners"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* 1. Most Requested Blood Type */}
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

                        {/* 2. Monthly Usage Trend */}
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

                        {/* 3. Status Distribution */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-purple-600" />
                                Request Status Distribution
                            </h3>
                            <div className="h-80 w-full flex justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={chartData.statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

// Simple Shield Icon component since it might not be exported directly or under a different name
const ShieldCheck = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default AdminDashboard;
