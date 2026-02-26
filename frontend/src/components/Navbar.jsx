import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ThemeToggle from './ThemeToggle';
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
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Logo */}
                    <Link to="/" onClick={close} className="flex-shrink-0 flex items-center font-bold text-lg sm:text-xl text-blue-600 dark:text-blue-400 gap-1.5 sm:gap-2 whitespace-nowrap">
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
                        <span>SnapPDF</span>
                    </Link>

                    {/* Desktop Items */}
                    <div className="hidden sm:flex items-center gap-4">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        <div className="flex items-center gap-2">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="nav-link">
                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                    </Link>
                                    <Link to="/create" className="btn-primary">
                                        <PlusCircle className="w-4 h-4" /> Create PDF
                                    </Link>
                                    <button onClick={handleLogout} className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 focus:outline-none">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="nav-link">
                                        <LogIn className="w-4 h-4" /> Log in
                                    </Link>
                                    <Link to="/register" className="btn-primary">
                                        <UserPlus className="w-4 h-4" /> Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex sm:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 -mr-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg">
                    <div className="px-4 py-3 space-y-1">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={close} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl font-medium transition-colors">
                                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                                </Link>
                                <Link to="/create" onClick={close} className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium transition-colors hover:bg-blue-700">
                                    <PlusCircle className="w-5 h-5" /> Create PDF
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors text-left">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={close} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl font-medium transition-colors">
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
