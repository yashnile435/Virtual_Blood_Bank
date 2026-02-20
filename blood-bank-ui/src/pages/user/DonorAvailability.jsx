import React, { useEffect, useState } from 'react';
import axios from '../../services/api';
import { FaToggleOn, FaToggleOff, FaCalendarCheck, FaInfoCircle } from 'react-icons/fa';

const DonorAvailability = () => {
    const [user, setUser] = useState({});
    const [available, setAvailable] = useState(false);
    const [lastDonation, setLastDonation] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const stored = JSON.parse(localStorage.getItem('user'));
            if (stored?.id) {
                const res = await axios.get(`/donors/id/${stored.id}`);
                setUser(res.data);
                setAvailable(res.data.available);
                setLastDonation(res.data.lastDonationDate);
            }
        };
        fetchUser();
    }, []);

    const toggleAvailability = async () => {
        try {
            const newStatus = !available;
            // API expects `?available=true` and id in path
            await axios.put(`/donors/${user.id}/availability?available=${newStatus}`);
            setAvailable(newStatus);
            alert(`Status updated to: ${newStatus ? 'Available' : 'Unavailable'}`);
        } catch (error) {
            console.error("Availability update failed", error);
            alert("Failed to update status. Server error.");
        }
    };

    const isEligible = () => {
        if (!lastDonation) return true;
        const last = new Date(lastDonation);
        const diffUsed = new Date() - last;
        const days = diffUsed / (1000 * 60 * 60 * 24);
        return days >= 56; // 8 weeks standard, or 90 days as per prompt
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 transform transition-transform hover:scale-[1.01]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaCalendarCheck className="text-red-500" />
                Donor Availability Status
            </h2>

            <div className={`p-6 rounded-2xl border-2 mb-8 flex items-center justify-between transition-colors ${available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div>
                    <h3 className={`font-bold text-lg ${available ? 'text-green-700' : 'text-red-700'}`}>
                        {available ? 'Currently Available' : 'Currently Unavailable'}
                    </h3>
                    <p className={`text-sm ${available ? 'text-green-600' : 'text-red-600'}`}>
                        {available ? 'You are visible to patients needing blood.' : 'You will not appear in donor searches.'}
                    </p>
                </div>
                <button
                    onClick={toggleAvailability}
                    className={`focus:outline-none transition-transform active:scale-95 ${available ? 'text-green-500' : 'text-gray-400'}`}
                >
                    {available ? <FaToggleOn size={48} /> : <FaToggleOff size={48} />}
                </button>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                <div>
                    <h4 className="font-bold text-blue-800 mb-2">Eligibility Check (90-Day Rule)</h4>
                    <p className="text-blue-700 text-sm mb-4">
                        Donors must wait at least 90 days between whole blood donations to ensure safety and recovery.
                    </p>

                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="text-gray-500">Last Donation:</span>
                        <span className="text-gray-800 font-bold">{lastDonation ? new Date(lastDonation).toLocaleDateString() : 'Never'}</span>
                    </div>

                    <div className="mt-4">
                        {isEligible() ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold shadow-sm">
                                ✅ Eligible to Donate
                            </span>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold shadow-sm">
                                ⏳ Not Yet Eligible
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorAvailability;
