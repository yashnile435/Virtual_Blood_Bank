import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    User,
    Droplet,
    Home,
    Menu,
    X,
    Save,
    Plus,
    Trash2,
    Activity
} from 'lucide-react';

const BloodBankDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory'); // 'profile' or 'inventory'
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

    // Fetch User and Initial Data
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/');
                return;
            }
            setUser(user);
            await fetchProfile(user.id);
            await fetchInventory(user.id);
            setLoading(false);
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
        navigate('/');
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
                            {activeTab === 'inventory' ? 'Inventory Management' : 'Profile Settings'}
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
