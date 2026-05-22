import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ChatWidget from '../common/ChatWidget';

function AdminLayout({ children }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Products', path: '/admin/products', icon: '📦' },
        { name: 'Categories', path: '/admin/categories', icon: '🏷️' },
        { name: 'Orders', path: '/admin/orders', icon: '🚛' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
    ];

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`bg-gray-900 text-white w-72 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}>
                <div className="p-8 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold shadow-lg">BP</div>
                    {isSidebarOpen && <span className="text-xl font-black uppercase tracking-tighter">Admin Central</span>}
                </div>

                <nav className="mt-8 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all group decoration-none ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span>{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-8 left-0 right-0 px-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all bg-transparent border-none cursor-pointer"
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-100 p-6 flex justify-between items-center shadow-sm relative z-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                    >
                        ☰
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-gray-900 uppercase">Administrator</p>
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">System Online</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                            AD
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    {children}
                </div>
            </main>
            <ChatWidget />
        </div>
    );
}

export default AdminLayout;
