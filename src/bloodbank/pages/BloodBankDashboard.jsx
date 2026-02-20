
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    User,
    Droplet,
    Menu,
    X,
    Plus,
    Trash2,
    Activity,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock
} from 'lucide-react';

const BloodBankDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory'); // 'profile', 'inventory', 'requests', 'history'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        city: '',
        address: '',
        phone: ''
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState(null);

    // Inventory State
    const [inventory, setInventory] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const [newBloodGroup, setNewBloodGroup] = useState('A+');
    const [newQuantity, setNewQuantity] = useState(0);

    // Requests State
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Fetch User and Initial Data
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/bloodbank/login');
                return;
            }
            setUser(user);
            await fetchProfile(user.id);
            await fetchInventory(user.id);
            await fetchInventory(user.id);
            await fetchRequests(user.id);
            await fetchHistory(user.id);
            setLoading(false);

            // Realtime subscription for requests
            const channel = supabase
                .channel('realtime-requests')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'blood_requests',
                        filter: `blood_bank_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('Realtime change received!', payload);
                        fetchRequests(user.id);
                        fetchHistory(user.id);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };
        fetchData();
    }, [navigate]);

    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('blood_banks')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) setProfile(data);
    };

    const fetchInventory = async (userId) => {
        setInventoryLoading(true);
        const { data, error } = await supabase
            .from('blood_inventory')
            .select('*')
            .eq('blood_bank_id', userId)
            .order('blood_group', { ascending: true });

        if (data) setInventory(data);
        setInventoryLoading(false);
    };

    const fetchRequests = async (userId) => {
        setRequestsLoading(true);
        const { data, error } = await supabase
            .from('blood_requests')
            .select('*')
            .eq('blood_bank_id', userId)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (data) setRequests(data);
        setRequestsLoading(false);
    };

    const fetchHistory = async (userId) => {
        setHistoryLoading(true);
        // We need user name from users table
        const { data, error } = await supabase
            .from('blood_requests')
            .select(`
                *,
                users ( name, email )
            `)
            .eq('blood_bank_id', userId)
            .order('created_at', { ascending: false });

        if (data) setHistory(data);
        setHistoryLoading(false);
    };

    const handleApproveRequest = async (request) => {
        try {
            // Step 1: Check blood_inventory quantity
            const { data: inventoryItem, error: fetchError } = await supabase
                .from('blood_inventory')
                .select('*')
                .eq('blood_bank_id', user.id)
                .eq('blood_group', request.blood_group)
                .single();

            if (fetchError || !inventoryItem) {
                alert("Error fetching inventory or blood group not found.");
                return;
            }

            if (inventoryItem.quantity <= 0) {
                alert("Insufficient stock! Cannot approve request.");
                return;
            }

            const quantityToDeduct = request.quantity || 1;

            if (inventoryItem.quantity < quantityToDeduct) {
                alert(`Insufficient stock! Request requires ${quantityToDeduct} units, but only ${inventoryItem.quantity} available.`);
                return;
            }

            // Step 2: Update blood_requests status to APPROVED
            const { error: updateRequestError } = await supabase
                .from('blood_requests')
                .update({ status: 'APPROVED' })
                .eq('id', request.id);

            if (updateRequestError) throw updateRequestError;

            // Step 3: Update blood_inventory quantity
            const { error: updateInventoryError } = await supabase
                .from('blood_inventory')
                .update({
                    quantity: inventoryItem.quantity - quantityToDeduct,
                    updated_at: new Date()
                })
                .eq('id', inventoryItem.id);

            if (updateInventoryError) {
                // Critical: If inventory update fails, we should ideally rollback request status
                // For this demo, we'll just alert.
                alert("Failed to update inventory, but request was approved. Please check manually.");
                throw updateInventoryError;
            }

            // Success
            // UI update handled by realtime or re-fetch, but let's update local state immediately for responsiveness
            setRequests(prev => prev.filter(r => r.id !== request.id));
            setInventory(prev => prev.map(item =>
                item.id === inventoryItem.id ? { ...item, quantity: item.quantity - quantityToDeduct } : item
            ));

            // Update history list if on history tab
            fetchHistory(user.id);

        } catch (err) {
            console.error(err);
            alert("Failed to approve request: " + err.message);
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;

        try {
            const { error } = await supabase
                .from('blood_requests')
                .update({ status: 'REJECTED' })
                .eq('id', requestId);

            if (error) throw error;

            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== requestId));
            fetchHistory(user.id);
        } catch (err) {
            console.error(err);
            alert("Failed to reject request.");
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage(null);

        const { error } = await supabase
            .from('blood_banks')
            .update({
                city: profile.city,
                address: profile.address,
                phone: profile.phone
            })
            .eq('id', user.id);

        if (error) {
            setProfileMessage({ type: 'error', text: 'Failed to update profile.' });
        } else {
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        }
        setProfileLoading(false);
    };

    const handleAddInventory = async () => {
        if (newQuantity < 0) return;

        // Check if blood group already exists
        const existing = inventory.find(item => item.blood_group === newBloodGroup);
        if (existing) {
            alert("Blood group already exists. Please update the quantity instead.");
            return;
        }

        const { data, error } = await supabase
            .from('blood_inventory')
            .insert([
                {
                    blood_bank_id: user.id,
                    blood_group: newBloodGroup,
                    quantity: parseInt(newQuantity)
                }
            ])
            .select();

        if (data) {
            setInventory([...inventory, data[0]]);
            setNewQuantity(0);
        }
    };

    const handleUpdateQuantity = async (id, newQty) => {
        if (newQty < 0) return;

        const { error } = await supabase
            .from('blood_inventory')
            .update({ quantity: newQty, updated_at: new Date() })
            .eq('id', id);

        if (!error) {
            setInventory(inventory.map(item =>
                item.id === id ? { ...item, quantity: newQty } : item
            ));
        }
    };

    const handleDeleteInventory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;

        const { error } = await supabase
            .from('blood_inventory')
            .delete()
            .eq('id', id);

        if (!error) {
            setInventory(inventory.filter(item => item.id !== id));
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/bloodbank/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;

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
                        <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                            <Activity className="h-6 w-6" />
                            VBBS Portal
                        </h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-red-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <button
                            onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-red-50 text-red-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Droplet className="h-5 w-5" />
                            Blood Inventory
                        </button>
                        <button
                            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-red-50 text-red-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <User className="h-5 w-5" />
                            Profile Settings
                        </button>
                        <button
                            onClick={() => { setActiveTab('requests'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'requests' ? 'bg-red-50 text-red-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FileText className="h-5 w-5" />
                            Blood Requests
                            {requests.length > 0 && (
                                <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {requests.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-red-50 text-red-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Clock className="h-5 w-5" />
                            Request History
                        </button>
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <div className="px-4 py-3 mb-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{profile.name}</p>
                            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                        </div>
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
                <header className="bg-white shadow-sm sticky top-0 z-10 lg:hidden">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 hover:text-red-600">
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">
                            {activeTab === 'inventory' ? 'Inventory Management' : activeTab === 'profile' ? 'Profile Settings' : activeTab === 'requests' ? 'Pending Requests' : 'Request History'}
                        </h1>
                        <div className="w-6" /> {/* Spacer for centering */}
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
                    {activeTab === 'inventory' ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Blood Inventory</h1>
                                    <p className="text-gray-500 text-sm">Manage available blood units in real-time</p>
                                </div>

                                {/* Add New Inventory Card (Collapsed on mobile, expanded on desktop usually, but here simplified) */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                    <div className="w-full sm:w-auto">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Blood Group</label>
                                        <select
                                            value={newBloodGroup}
                                            onChange={(e) => setNewBloodGroup(e.target.value)}
                                            className="w-full sm:w-24 px-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                                        >
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Units (ml/bag)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newQuantity}
                                            onChange={(e) => setNewQuantity(e.target.value)}
                                            className="w-full sm:w-32 px-3 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddInventory}
                                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors font-medium"
                                    >
                                        <Plus className="h-4 w-4" /> Add Stock
                                    </button>
                                </div>
                            </div>

                            {/* Inventory Grid */}
                            {inventoryLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading inventory...</div>
                            ) : inventory.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <Droplet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No blood stock added yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {inventory.map((item) => (
                                        <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`
                          h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold
                          ${item.blood_group.includes('+') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                        `}>
                                                    {item.blood_group}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteInventory(item.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Available Units</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                        className="w-20 px-2 py-1 text-2xl font-bold text-gray-800 border-b-2 border-transparent focus:border-red-500 focus:bg-gray-50 outline-none transition-all"
                                                    />
                                                    <span className="text-sm text-gray-500 font-medium">Bags</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 flex items-center gap-1">
                                                <Activity className="h-3 w-3" />
                                                Last updated: {new Date(item.updated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'requests' ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Blood Requests</h1>
                                    <p className="text-gray-500 text-sm">Manage incoming blood requests from patients</p>
                                </div>
                            </div>

                            {requestsLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading requests...</div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No pending requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {requests.map((req) => (
                                        <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{req.patient_name}</h3>
                                                    <p className="text-xs text-gray-500">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-lg text-sm">
                                                    {req.blood_group} ({req.quantity || 1} units)
                                                </span>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase">Hospital</p>
                                                    <p className="text-sm text-gray-800 font-medium">{req.hospital_name || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500 truncate">{req.hospital_address || 'No address provided'}</p>
                                                </div>

                                                {req.required_within_30_days && (
                                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <p className="text-xs font-bold">Urgent: Required within 30 days</p>
                                                    </div>
                                                )}

                                                <div className="mt-2 text-xs text-gray-500">
                                                    For: <span className="font-medium text-gray-700">{req.booking_for || 'SELF'}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
                                                <button
                                                    onClick={() => handleRejectRequest(req.id)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
                                                >
                                                    <XCircle className="h-4 w-4" /> Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApproveRequest(req)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm shadow-md"
                                                >
                                                    <CheckCircle className="h-4 w-4" /> Approve
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'history' ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Request History</h1>
                                    <p className="text-gray-500 text-sm">View all past and present blood requests</p>
                                </div>
                            </div>

                            {historyLoading ? (
                                <div className="text-center py-10 text-gray-500">Loading history...</div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No request history found.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                                                    <th className="px-6 py-4">Request Details</th>
                                                    <th className="px-6 py-4">Quantity</th>
                                                    <th className="px-6 py-4">Patient / Hospital</th>
                                                    <th className="px-6 py-4">Requested By</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {history.map((req) => (
                                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${req.blood_group.includes('+') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                    {req.blood_group}
                                                                </div>
                                                                {req.required_within_30_days && (
                                                                    <div title="Urgent: Required within 30 days">
                                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-semibold text-gray-700">
                                                            {req.quantity || 1} Units
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">{req.patient_name}</div>
                                                            <div className="text-xs text-gray-500">{req.hospital_name || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">{req.users?.name || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500 capitalize">{req.booking_for?.toLowerCase() || 'self'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(req.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize
                                                                ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                                {req.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                                                                {req.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                                                                {req.status === 'PENDING' && <Activity className="h-3 w-3" />}
                                                                {req.status.toLowerCase()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <h1 className="text-2xl font-bold text-gray-900 hidden lg:block mb-6">Profile Settings</h1>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 sm:p-8 space-y-6">
                                    {profileMessage && (
                                        <div className={`p-4 rounded-lg text-sm ${profileMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                            {profileMessage.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Bank Name</label>
                                                <input
                                                    type="text"
                                                    value={profile.name}
                                                    disabled
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Contact admin to change name</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    disabled
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <input
                                                    type="text"
                                                    value={profile.address || ''}
                                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                    <input
                                                        type="text"
                                                        value={profile.city || ''}
                                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                                        required
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={profile.phone || ''}
                                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                        required
                                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-end">
                                            <button
                                                type="submit"
                                                disabled={profileLoading}
                                                className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 ${profileLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
                                            >
                                                {profileLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BloodBankDashboard;
