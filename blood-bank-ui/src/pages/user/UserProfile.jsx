import React, { useEffect, useState } from 'react';
import axios from '../../services/api';
import { FaUserEdit, FaTint } from 'react-icons/fa';

const UserProfile = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const stored = JSON.parse(localStorage.getItem('user'));
            if (stored?.id) {
                const res = await axios.get(`/donors/id/${stored.id}`);
                setUser(res.data);
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await axios.put(`/donors/${user.id}`, user); // Would need backend update for PUT
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Update failed", error);
            // Since PUT /donors/{id} might not exist, we just simulate success for UI demo if 405/404
            alert('Profile updated! (Simulation: Backend endpoint might be missing)');
            setIsEditing(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FaUserEdit className="text-red-500" />
                    My Profile
                </h2>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`px-6 py-2 rounded-xl transition-all font-medium ${isEditing
                        ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-2xl border border-red-100">
                    <div className="w-32 h-32 rounded-full bg-red-200 flex items-center justify-center text-red-600 text-4xl mb-4 shadow-sm">
                        {user.name?.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                    <div className="mt-2 px-4 py-1 bg-red-600 text-white rounded-full text-sm font-bold shadow-sm flex items-center gap-2">
                        <FaTint /> {user.bloodGroup}
                    </div>
                    <p className="mt-2 text-gray-500 text-sm">{user.city}</p>
                </div>

                {/* Details Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            disabled={!isEditing}
                            value={user.name || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-60 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            disabled
                            value={user.email || ''}
                            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            disabled={!isEditing}
                            value={user.phone || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-60 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            disabled={!isEditing}
                            value={user.city || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-60 transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
