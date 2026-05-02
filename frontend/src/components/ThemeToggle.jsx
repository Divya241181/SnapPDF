import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                toggleTheme();
            }}
            className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center p-1 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-inner"
            aria-label="Toggle dark mode"
        >
            {/* Background Icons */}
            <div className="absolute inset-0 flex justify-between items-center px-2.5 pointer-events-none">
                <Sun className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                <Moon className="w-3 h-3 text-slate-400 dark:text-slate-600" />
            </div>

            <div
                className="z-10 w-5 h-5 rounded-full bg-white dark:bg-blue-600 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300"
                style={{ transform: theme === 'dark' ? 'translateX(28px)' : 'translateX(0)' }}
            >
                {theme === 'light' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                    <Moon className="w-3.5 h-3.5 text-white" />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;
