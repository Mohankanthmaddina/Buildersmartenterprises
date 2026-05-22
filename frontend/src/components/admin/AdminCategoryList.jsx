import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function AdminCategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' });

    // Advanced Filtering and Sorting states
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/admin/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await axios.put(`/api/admin/categories/${editingCategory.id}`, formData);
            } else {
                await axios.post('/api/admin/categories', formData);
            }
            setShowModal(false);
            fetchCategories();
            alert('Category synchronized.');
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this industrial category? This will affect material classification.')) return;
        try {
            await axios.delete(`/api/admin/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert('Delete failed.');
        }
    };

    // Filter and Sort logic
    const filteredCategories = categories.filter(cat => {
        if (search) {
            const term = search.toLowerCase();
            const nameMatch = cat.name?.toLowerCase().includes(term);
            const descMatch = cat.description?.toLowerCase().includes(term);
            if (!nameMatch && !descMatch) return false;
        }
        return true;
    }).sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
        if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
        return 0;
    });

    if (loading) return <AdminLayout><div className="p-20 text-center italic text-gray-400">Loading Classification Data...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Market Classification</h1>
                        <p className="text-gray-500 font-medium italic">Organize materials into logical industrial sectors.</p>
                    </div>
                    <button
                        onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '', imageUrl: '' }); setShowModal(true); }}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all border-none cursor-pointer"
                    >
                        + Define New Sector
                    </button>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Search Sectors</label>
                            <input
                                type="text"
                                placeholder="Sector name or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
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
                                onClick={() => { setSearch(''); setSortBy('name-asc'); }}
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </div>

                {filteredCategories.length === 0 ? (
                    <div className="p-20 text-center text-gray-400 font-bold italic bg-white rounded-[2.5rem] border border-gray-100">
                        No matching sectors found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCategories.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                                    {cat.name.toLowerCase().includes('cement') ? '🏗️' :
                                        cat.name.toLowerCase().includes('tiles') ? '🏬' :
                                            cat.name.toLowerCase().includes('iron') ? '⚡' :
                                                cat.name.toLowerCase().includes('hardware') ? '🛠️' : '📦'}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">{cat.name}</h3>
                                <p className="text-gray-500 text-sm mb-8 italic line-clamp-2">{cat.description || 'General industrial material category.'}</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setEditingCategory(cat); setFormData({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' }); setShowModal(true); }}
                                        className="flex-1 bg-gray-50 text-gray-800 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer"
                                    >
                                        Edit Sector
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="bg-red-50 text-red-500 px-4 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            {/* Visual pattern background */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                        </div>
                    ))}
                </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in slide-in-from-bottom-8">
                            <div className="bg-gray-900 p-8 text-white">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">{editingCategory ? 'Update Sector' : 'Define New Sector'}</h2>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Classification Management</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Sector Name</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Sector Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="http://asset-server.com/img.jpg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Sector Scope / Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 font-bold outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="flex gap-4">
                                    <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all border-none cursor-pointer">
                                        {editingCategory ? 'Commit Sector' : 'Authorize Placement'}
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="px-10 bg-gray-100 text-gray-400 py-5 rounded-2xl font-black hover:bg-gray-200 transition-all border-none cursor-pointer">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminCategoryList;
