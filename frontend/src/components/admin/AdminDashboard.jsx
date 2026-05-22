import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import { redirectToSupport } from '../../utils/support';


function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/admin/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching admin stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AdminLayout><div className="p-20 text-center font-bold">Synchronizing System Metrics...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Operational Overview</h1>
                        <p className="text-gray-500 font-medium italic">Real-time metrics and system health monitoring.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Server: Ultra Stable</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} icon="💰" color="blue" />
                    <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon="🕒" color="amber" />
                    <StatCard title="Active Materials" value={stats?.totalProducts || 0} icon="🏗️" color="emerald" />
                    <StatCard title="Customer Base" value={stats?.totalUsers || 0} icon="👥" color="indigo" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white rounded-[3rem] p-4 lg:p-10 shadow-sm border border-gray-50">
                        <h3 className="text-xl font-black text-gray-800 mb-8 border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">System Activity</h3>
                        <div className="space-y-8">
                            <ActivityRow label="Database Connectivity" status="Optimized" color="emerald" />
                            <ActivityRow label="Payment Gateway" status="Active" color="emerald" />
                            <ActivityRow label="Inventory Services" status="Synchronized" color="blue" />
                            <ActivityRow label="Cloud Storage" status="Online" color="emerald" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-[3rem] p-12 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Admin Support</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                Need help with system configuration or data migration? Our technical architects are available 24/7.
                            </p>
                            <button
                                onClick={redirectToSupport}
                                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all border-none cursor-pointer"
                            >
                                Connect with Engineering
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, value, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 hover:shadow-xl hover:scale-105 transition-all duration-500">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${colors[color]} border shadow-inner`}>
                {icon}
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-black text-gray-900">{value}</h4>
        </div>
    );
}

function ActivityRow({ label, status, color }) {
    const dotColors = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
    };
    return (
        <div className="flex justify-between items-center group">
            <span className="font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-tight text-sm">{label}</span>
            <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${dotColors[color]}`}></span>
                <span className={`font-black text-xs uppercase tracking-widest text-gray-400 group-hover:text-${color}-600 transition-colors`}>{status}</span>
            </div>
        </div>
    );
}

export default AdminDashboard;
