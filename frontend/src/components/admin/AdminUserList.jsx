import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Advanced Filtering and Sorting states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleVerification = async (id, currentStatus) => {
        try {
            await axios.put(`/api/admin/users/${id}/verification?isVerified=${!currentStatus}`);
            fetchUsers();
            alert('Verification status updated.');
        } catch (err) {
            alert('Update failed.');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Revoke access and delete this user? This action is permanent.')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    // Filter and Sort logic
    const filteredUsers = users.filter(user => {
        if (search) {
            const term = search.toLowerCase();
            const matchesName = user.name?.toLowerCase().includes(term);
            const matchesEmail = user.email?.toLowerCase().includes(term);
            const matchesPhone = user.phone?.toLowerCase().includes(term);
            if (!matchesName && !matchesEmail && !matchesPhone) return false;
        }

        if (statusFilter) {
            if (statusFilter === 'verified' && !user.isVerified) return false;
            if (statusFilter === 'pending' && user.isVerified) return false;
        }

        return true;
    }).sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
        if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
        return 0;
    });

    if (loading) return <AdminLayout><div className="p-20 text-center uppercase font-black text-gray-400 italic">Authenticating User Registry...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Authenticated Stakeholders</h1>
                    <p className="text-gray-500 font-medium italic">Manage project clients, authorize credentials, and oversee system access.</p>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Search Users</label>
                            <input
                                type="text"
                                placeholder="Name, email, phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Security Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 bg-white cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="verified">Identity Verified</option>
                                <option value="pending">Pending Review</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 bg-white cursor-pointer"
                            >
                                <option value="name-asc">Name: A-Z</option>
                                <option value="name-desc">Name: Z-A</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setSearch(''); setStatusFilter(''); setSortBy('name-asc'); }}
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900 text-white">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">User Profile</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Contact</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Security Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Access Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-gray-400 font-bold italic">
                                        No matching stakeholders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.name || 'Anonymous Client'}</p>
                                                <p className="text-xs text-gray-400 italic">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm font-medium text-gray-600">{user.phone || 'No Contact Data'}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isVerified ? 'Identity Verified' : 'Pending Review'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => toggleVerification(user.id, user.isVerified)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-none cursor-pointer ${user.isVerified ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                            >
                                                {user.isVerified ? 'Suspend' : 'Verify'}
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminUserList;
