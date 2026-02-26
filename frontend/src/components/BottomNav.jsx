import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, PlusCircle, LogIn } from 'lucide-react';
import useAuthStore from '../store/authStore';

const BottomNav = () => {
    const { isAuthenticated } = useAuthStore();

    const baseClass = "flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors pt-2 pb-1 flex-1";
    const activeClass = "text-blue-600";
    const inactiveClass = "text-slate-400";

    if (!isAuthenticated) return null;

    return (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex z-50 safe-area-bottom">
            <NavLink to="/" end className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
                <Home className="w-5 h-5" />
                Home
            </NavLink>
            <NavLink to="/create" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center -mt-5 mb-0.5 shadow-lg ${true ? 'bg-blue-600' : 'bg-slate-600'}`}>
                    <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <span>Create</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
                <LayoutDashboard className="w-5 h-5" />
                My PDFs
            </NavLink>
        </nav>
    );
};

export default BottomNav;
