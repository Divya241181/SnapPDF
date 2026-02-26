import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../store/themeStore';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-14 h-7" />;

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
            {/* Background Icons - Swapped for better visual overlap logic */}
            <div className="absolute inset-0 flex justify-between items-center px-2.5 pointer-events-none">
                <Sun className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                <Moon className="w-3 h-3 text-slate-400 dark:text-slate-600" />
            </div>

            <motion.div
                className="z-10 w-5 h-5 rounded-full bg-white dark:bg-blue-600 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                animate={{
                    x: theme === 'dark' ? 28 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {theme === 'light' ? (
                        <motion.div
                            key="sun"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Sun className="w-3.5 h-3.5 text-amber-500 animate-pulse-slow" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Moon className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
