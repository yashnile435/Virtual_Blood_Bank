import React, { useEffect, useState } from 'react';
import axios from '../../services/api';
import { FaPlus, FaSearch } from 'react-icons/fa';

const BloodRequests = () => {
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('list'); // list | create
    const [newRequest, setNewRequest] = useState({
        patientName: '',
        hospitalName: '',
        bloodGroup: '',
        unitsRequired: 1,
        city: '',
        status: 'PENDING'
    });

    useEffect(() => {
        axios.get('/requests').then(res => setRequests(res.data)).catch(err => console.error(err));
    }, [view]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/requests', newRequest);
            setView('list');
            alert('Request submitted successfully!');
        } catch (error) {
            alert('Submission failed.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Blood Requests</h2>
                    <p className="text-gray-500 text-sm">Active needs in your community</p>
                </div>
                {view === 'list' && (
                    <button
                        onClick={() => setView('create')}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-red-700 transition-all font-bold"
                    >
                        <FaPlus /> New Request
                    </button>
                )}
                {view === 'create' && (
                    <button
                        onClick={() => setView('list')}
                        className="text-gray-500 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {view === 'create' ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto border border-gray-100">
                    <h3 className="text-xl font-bold mb-6 text-gray-800">Request Blood</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Patient Name" className="p-3 border rounded-xl" required onChange={e => setNewRequest({ ...newRequest, patientName: e.target.value })} />
                            <input placeholder="Hospital Name" className="p-3 border rounded-xl" required onChange={e => setNewRequest({ ...newRequest, hospitalName: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select className="p-3 border rounded-xl" required onChange={e => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}>
                                <option value="">Blood Group</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                            <input type="number" placeholder="Units" className="p-3 border rounded-xl" required min="1" onChange={e => setNewRequest({ ...newRequest, unitsRequired: e.target.value })} />
                        </div>
                        <input placeholder="City" className="p-3 border rounded-xl w-full" required onChange={e => setNewRequest({ ...newRequest, city: e.target.value })} />

                        <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 mt-4 shadow-md">
                            Submit Request
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No requests found. Create one!</p>}
                    {requests.map(req => (
                        <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow group">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-bold">{req.bloodGroup}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{req.patientName || 'Unknown Patient'}</h3>
                                <p className="text-sm text-gray-500 mb-2">{req.hospitalName}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    📍 {req.city} • {new Date(req.requestDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Needed: {req.unitsRequired} Units</span>
                                <button className="text-red-600 text-sm font-bold hover:underline">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BloodRequests;
