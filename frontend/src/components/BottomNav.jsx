import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, PlusCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

const BottomNav = () => {
    const { isAuthenticated } = useAuthStore();

    const baseClass = "flex flex-col items-center justify-center gap-0.5 text-[10px] xs:text-xs font-medium transition-all pt-2 pb-1 flex-1";
    const activeClass = "text-blue-600 dark:text-blue-400";
    const inactiveClass = "text-slate-400 dark:text-slate-500";

    if (!isAuthenticated) return null;

    return (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex z-50 safe-area-bottom transition-colors duration-300">
            <NavLink to="/" end className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
                <Home className="w-5 h-5" />
                <span>Home</span>
            </NavLink>
            <NavLink to="/create" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center -mt-6 mb-0.5 shadow-lg bg-blue-600 dark:bg-blue-500 ring-4 ring-white dark:ring-slate-900 transition-all active:scale-90">
                    <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <span>Create</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span>My PDFs</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
