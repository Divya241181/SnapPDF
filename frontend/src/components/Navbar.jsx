import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { FileText, Menu, X, LayoutDashboard, PlusCircle, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    const close = () => setMenuOpen(false);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Logo */}
                    <Link to="/" onClick={close} className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600 gap-2">
                        <FileText className="w-7 h-7" />
                        <span>SnapPDF</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden sm:flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors flex items-center gap-1.5">
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                                <Link to="/create" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-1.5">
                                    <PlusCircle className="w-4 h-4" /> Create PDF
                                </Link>
                                <button onClick={handleLogout} className="text-rose-500 hover:text-rose-600 font-medium px-3 py-2 rounded-md transition-colors flex items-center gap-1.5">
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors flex items-center gap-1.5">
                                    <LogIn className="w-4 h-4" /> Log in
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-1.5">
                                    <UserPlus className="w-4 h-4" /> Sign up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="flex sm:hidden items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="sm:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-lg">
                    <div className="px-4 py-3 space-y-1">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={close} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors">
                                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                                </Link>
                                <Link to="/create" onClick={close} className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium transition-colors hover:bg-blue-700">
                                    <PlusCircle className="w-5 h-5" /> Create PDF
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl font-medium transition-colors">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={close} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition-colors">
                                    <LogIn className="w-5 h-5" /> Log in
                                </Link>
                                <Link to="/register" onClick={close} className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium transition-colors hover:bg-blue-700">
                                    <UserPlus className="w-5 h-5" /> Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
