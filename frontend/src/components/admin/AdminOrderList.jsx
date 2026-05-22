import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';

function AdminOrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Advanced Filter and Sort states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/admin/orders');
            setOrders(response.data);
            
            // If modal is open, keep selectedOrder sync'd with the latest refetched data
            if (selectedOrder) {
                const updated = response.data.find(o => o.id === selectedOrder.id);
                if (updated) {
                    setSelectedOrder(updated);
                }
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/admin/orders/${id}/status?status=${status}`);
            
            // Instantly update local selectedOrder state to prevent jumpy rendering
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder(prev => ({ ...prev, status }));
            }
            
            await fetchOrders();
            alert('Order status updated. Email notification sent to user.');
        } catch (err) {
            alert('Update failed.');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('date-desc');
    };

    // Filter and Sort Logic
    const filteredOrders = orders.filter(order => {
        if (search) {
            const term = search.toLowerCase();
            const matchesNumber = order.orderNumber?.toLowerCase().includes(term);
            const matchesName = order.userName?.toLowerCase().includes(term);
            const matchesEmail = order.userEmail?.toLowerCase().includes(term);
            if (!matchesNumber && !matchesName && !matchesEmail) return false;
        }

        if (statusFilter && order.status !== statusFilter) {
            return false;
        }

        const orderTime = new Date(order.orderDate).getTime();
        if (startDate) {
            const start = new Date(startDate).setHours(0,0,0,0);
            if (orderTime < start) return false;
        }
        if (endDate) {
            const end = new Date(endDate).setHours(23,59,59,999);
            if (orderTime > end) return false;
        }

        const amt = order.finalAmount || order.totalAmount || 0;
        if (minAmount && amt < parseFloat(minAmount)) return false;
        if (maxAmount && amt > parseFloat(maxAmount)) return false;

        return true;
    }).sort((a, b) => {
        const amtA = a.finalAmount || a.totalAmount || 0;
        const amtB = b.finalAmount || b.totalAmount || 0;
        if (sortBy === 'date-desc') return new Date(b.orderDate) - new Date(a.orderDate);
        if (sortBy === 'date-asc') return new Date(a.orderDate) - new Date(b.orderDate);
        if (sortBy === 'amount-desc') return amtB - amtA;
        if (sortBy === 'amount-asc') return amtA - amtB;
        return 0;
    });

    if (loading) return <AdminLayout><div className="p-20 text-center uppercase tracking-widest font-bold text-gray-400">Scanning Logistics Registry...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Global Logistics</h1>
                    <p className="text-gray-500 font-medium italic">Track fulfillment, manage deliveries, and oversee project distributions. Click on any transaction row to inspect details.</p>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Search Orders</label>
                            <input
                                type="text"
                                placeholder="Order #, client name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 bg-white cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 bg-white cursor-pointer"
                            >
                                <option value="date-desc">Date: Newest First</option>
                                <option value="date-asc">Date: Oldest First</option>
                                <option value="amount-desc">Investment: High to Low</option>
                                <option value="amount-asc">Investment: Low to High</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border-none cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Date From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Date To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Min Investment (₹)</label>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Max Investment (₹)</label>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900 text-white">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Transaction ID</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Customer</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Asset Volume</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Workflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-gray-400 font-bold italic">
                                        No matching transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        className="hover:bg-gray-50/85 transition-all cursor-pointer group"
                                        onClick={(e) => {
                                            // Ignore row-click if we click directly on the dropdown selector
                                            if (e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
                                            setSelectedOrder(order);
                                            setShowModal(true);
                                        }}
                                    >
                                        <td className="p-6">
                                            <p className="font-black text-blue-600 uppercase text-xs group-hover:underline">#{order.orderNumber}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-6">
                                            <p className="font-bold text-gray-900">{order.userName}</p>
                                            <p className="text-xs text-gray-400 italic">Project Client</p>
                                        </td>
                                        <td className="p-6 font-black text-gray-800 italic">₹{order.finalAmount?.toFixed(2) || '0.00'}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <select
                                                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Order Details Modal */}
                {showModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-500">
                            {/* Modal Header */}
                            <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Order Details</h2>
                                    <p className="text-blue-400 text-xs font-bold uppercase mt-1">Transaction #{selectedOrder.orderNumber}</p>
                                </div>
                                <button 
                                    onClick={() => { setShowModal(false); setSelectedOrder(null); }} 
                                    className="text-gray-400 hover:text-white text-2xl bg-transparent border-none cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[65vh] overflow-y-auto">
                                {/* Left Side: Customer & Shipping Information (5 columns) */}
                                <div className="md:col-span-5 space-y-6 border-r border-gray-100 pr-6">
                                    <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">Client Information</h3>
                                    
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Customer Name</p>
                                        <p className="font-bold text-gray-800 text-sm">{selectedOrder.userName}</p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Email Address</p>
                                        <p className="font-bold text-gray-800 text-sm">{selectedOrder.userEmail || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Contact Number</p>
                                        <p className="font-bold text-gray-800 text-sm">{selectedOrder.userMobileNumber || 'N/A'}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Delivery Destination</p>
                                        <p className="font-bold text-gray-600 text-sm leading-relaxed">{selectedOrder.address}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Order Date</p>
                                            <p className="font-bold text-gray-800 text-xs">{selectedOrder.orderDateDisplay || new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Delivery Date</p>
                                            <p className="font-bold text-gray-800 text-xs">{selectedOrder.deliveryDateDisplay || (selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleString() : 'Pending Delivery')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-gray-50">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Modify Workflow Status</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 appearance-none cursor-pointer"
                                            value={selectedOrder.status}
                                            onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Right Side: Products & Pricing Summary (7 columns) */}
                                <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">Material Manifest</h3>
                                        <div className="divide-y divide-gray-100 max-h-[30vh] overflow-y-auto pr-2 mt-4 space-y-4">
                                            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                                selectedOrder.orderItems.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between py-3 first:pt-0">
                                                        <div className="flex items-center gap-4">
                                                            <img 
                                                                src={item.productImage || 'https://via.placeholder.com/60'} 
                                                                className="w-14 h-14 rounded-xl object-cover shadow-sm bg-gray-50" 
                                                                alt={item.productName} 
                                                            />
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                                                                <p className="text-xs text-gray-400">{item.productBrand} &bull; Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-gray-900 italic text-sm">₹{item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</p>
                                                            <p className="text-[10px] text-gray-400">₹{item.price?.toFixed(2)} / unit</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 italic text-sm text-center py-6">No products found in this manifest.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pricing Breakdown Card */}
                                    <div className="bg-gray-50 rounded-3xl p-6 space-y-3">
                                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                                            <span>Cart Subtotal</span>
                                            <span>₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                                            <span>Logistic Delivery Charge</span>
                                            <span>+ ₹{selectedOrder.deliveryCharge?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-semibold text-emerald-600">
                                            <span>Cluster Cashback Discount</span>
                                            <span>- ₹{selectedOrder.discountAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-200/60 font-black text-gray-900 text-lg italic">
                                            <span>Total Investment</span>
                                            <span className="text-blue-600 font-bold">₹{selectedOrder.finalAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 p-6 flex justify-end">
                                <button
                                    onClick={() => { setShowModal(false); setSelectedOrder(null); }}
                                    className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer border-none"
                                >
                                    Dismiss Manifest
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminOrderList;
