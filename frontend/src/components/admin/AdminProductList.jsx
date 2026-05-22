import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function AdminProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        brand: '',
        stockQuantity: '',
        specifications: ''
    });

    // Advanced Filter and Sort states
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                axios.get('/api/admin/products'),
                axios.get('/api/admin/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            categoryId: '',
            imageUrl: '',
            brand: '',
            stockQuantity: '',
            specifications: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate specifications as JSON if provided
        let cleanedSpecifications = null;
        if (formData.specifications && formData.specifications.trim() !== '') {
            try {
                JSON.parse(formData.specifications);
                cleanedSpecifications = formData.specifications.trim();
            } catch (err) {
                alert('Specifications must be in valid JSON format (e.g., {"Color": "Gray", "Weight": "50kg"})');
                return;
            }
        }

        const payload = {
            ...formData,
            specifications: cleanedSpecifications,
            price: parseFloat(formData.price),
            stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity, 10) : 0
        };

        try {
            if (editingProduct) {
                await axios.put(`/api/admin/products/${editingProduct.id}`, payload);
            } else {
                await axios.post('/api/admin/products', payload);
            }
            setShowModal(false);
            resetForm();
            fetchData();
            alert('Operation successful!');
        } catch (err) {
            alert('Error: ' + (err.response?.data || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this industrial asset?')) return;
        try {
            await axios.delete(`/api/admin/products/${id}`);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            categoryId: product.categoryId || '',
            imageUrl: product.imageUrl || '',
            brand: product.brand || '',
            stockQuantity: product.stockQuantity !== undefined && product.stockQuantity !== null ? product.stockQuantity : '',
            specifications: product.specifications || ''
        });
        setShowModal(true);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setStockFilter('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('');
    };

    // Filter and Sort Logic
    const filteredProducts = products.filter(p => {
        if (search) {
            const term = search.toLowerCase();
            const matchesName = p.name?.toLowerCase().includes(term);
            const matchesBrand = p.brand?.toLowerCase().includes(term);
            const matchesDesc = p.description?.toLowerCase().includes(term);
            if (!matchesName && !matchesBrand && !matchesDesc) return false;
        }

        if (categoryFilter && String(p.categoryId) !== String(categoryFilter)) {
            return false;
        }

        if (stockFilter) {
            const stock = p.stockQuantity || 0;
            if (stockFilter === 'out' && stock > 0) return false;
            if (stockFilter === 'low' && (stock <= 0 || stock > 10)) return false;
            if (stockFilter === 'in' && stock <= 10) return false;
        }

        if (minPrice && p.price < parseFloat(minPrice)) return false;
        if (maxPrice && p.price > parseFloat(maxPrice)) return false;

        return true;
    }).sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-asc') return (a.stockQuantity || 0) - (b.stockQuantity || 0);
        if (sortBy === 'stock-desc') return (b.stockQuantity || 0) - (a.stockQuantity || 0);
        return 0;
    });

    if (loading) return <AdminLayout><div className="p-20 text-center uppercase font-black text-gray-400 italic">Accessing Inventory...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Material Inventory</h1>
                        <p className="text-gray-500 font-medium italic">Manage stock levels, pricing, and product specifications.</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all border-none cursor-pointer"
                    >
                        + Register New Material
                    </button>
                </div>

                {/* Filters card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Search Materials</label>
                            <input
                                type="text"
                                placeholder="Name, brand, desc..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 bg-white cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Stock Level</label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 bg-white cursor-pointer"
                            >
                                <option value="">All Stock Levels</option>
                                <option value="out">Out of Stock (0)</option>
                                <option value="low">Low Stock (1-10)</option>
                                <option value="in">In Stock (&gt;10)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 bg-white cursor-pointer"
                            >
                                <option value="">Relevance</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="stock-asc">Stock: Low to High</option>
                                <option value="stock-desc">Stock: High to Low</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Min Price (₹)</label>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Max Price (₹)</label>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="lg:col-span-2 flex items-end">
                            <button
                                onClick={handleClearFilters}
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
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Material Item</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Category</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Stock Level</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Unit Price</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-gray-400 font-bold italic">
                                        No materials match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <img src={p.imageUrl || 'https://via.placeholder.com/40'} className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100" alt="" />
                                                <div>
                                                    <p className="font-bold text-gray-900">{p.name}</p>
                                                    <p className="text-xs text-gray-400 italic line-clamp-1">{p.brand} &bull; {p.description || 'No description provided.'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                {p.categoryName || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.stockQuantity > 10 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {p.stockQuantity || 0} Units
                                            </span>
                                        </td>
                                        <td className="p-6 font-black text-gray-800 italic">₹{p.price.toFixed(2)}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(p)} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer">✏️</button>
                                                <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border-none cursor-pointer">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                            <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">{editingProduct ? 'Edit Material' : 'Register New Material'}</h2>
                                    <p className="text-gray-400 text-xs font-bold uppercase mt-1">Industrial Specification Form</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl bg-transparent border-none cursor-pointer">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Material Name</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Unit Price (₹)</label>
                                        <input
                                            type="number" step="0.01" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Brand</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Stock Quantity</label>
                                        <input
                                            type="number" required
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Category Assignment</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 appearance-none"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        <option value="">Select an industrial category...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Image Source URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="http://asset-server.com/img.jpg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Specifications (JSON format)</label>
                                    <textarea
                                        rows="2"
                                        placeholder='e.g., {"Grade": "OPC 53", "Weight": "50kg"}'
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                                        value={formData.specifications}
                                        onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-4">Material Description</label>
                                    <textarea
                                        rows="3"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl border-none cursor-pointer"
                                    >
                                        {editingProduct ? 'Commit Updates' : 'Authorize Placement'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-10 bg-gray-100 text-gray-400 py-5 rounded-2xl font-black hover:bg-gray-200 transition-all border-none cursor-pointer"
                                    >
                                        Abandon
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

export default AdminProductList;
