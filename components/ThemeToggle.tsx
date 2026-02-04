'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-14 h-8 bg-gray-200 rounded-full" />;
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`
                relative w-16 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isDark ? 'bg-slate-700' : 'bg-gray-200'}
            `}
            aria-label="Toggle Theme"
        >
            <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                animate={{ x: isDark ? 32 : 0 }}
            >
                {isDark ? (
                    <Moon size={14} className="text-slate-800" />
                ) : (
                    <Sun size={14} className="text-orange-500" />
                )}
            </motion.div>
        </button>
    );
}
