import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from '../services/api';

const StatCard = ({ title, value, color, icon }) => (
    <div className="card glass-panel" style={{ padding: '1.5rem', background: '#fff' }}>
        <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                {title}
            </h3>
            <span style={{ fontSize: '1.2rem', color: color }}>{icon}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {value}
        </div>
        <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            + Update live
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        donors: 0,
        requests: 0,
        inventory: 0,
        admins: 0
    });

    useEffect(() => {
        // Mock data fetching or real API calls here
        // Example:
        // axios.get('/donors/count').then(res => setStats({...stats, donors: res.data}));
        // For now, use mock to show layout
        setStats({
            donors: 124,
            requests: 8,
            inventory: 450,
            admins: 2
        });
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
            <Navbar />

            <main className="container" style={{ padding: '2rem 1rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Dashboard Overview
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Admin. Here is what's happening today.</p>
                </div>

                <div className="grid grid-cols-4">
                    <StatCard
                        title="Total Donors"
                        value={stats.donors}
                        color="var(--primary-color)"
                        icon="🩸"
                    />
                    <StatCard
                        title="Active Requests"
                        value={stats.requests}
                        color="var(--warning)"
                        icon="⚠️"
                    />
                    <StatCard
                        title="Blood Units"
                        value={stats.inventory}
                        color="var(--secondary-color)"
                        icon="🧊"
                    />
                    <StatCard
                        title="Administrators"
                        value={stats.admins}
                        color="var(--accent-color)"
                        icon="🛡️"
                    />
                </div>

                <div className="grid grid-cols-2 mt-4" style={{ marginTop: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
                        <h3 className="mb-4" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Recent Requests</h3>
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            <p>No pending requests.</p>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>View All Requests</button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
                        <h3 className="mb-4" style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="btn btn-secondary w-full" style={{ justifyContent: 'start' }}>
                                + Add New Donor
                            </button>
                            <button className="btn btn-secondary w-full" style={{ justifyContent: 'start' }}>
                                + Create Request
                            </button>
                            <button className="btn btn-secondary w-full" style={{ justifyContent: 'start' }}>
                                Inventory Check
                            </button>
                            <button className="btn btn-secondary w-full" style={{ justifyContent: 'start' }}>
                                Manage Admins
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
