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
        return (
            <button className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400">
                <Sun size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="relative p-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors overflow-hidden"
            aria-label="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'dark' ? 0 : 1,
                    rotate: theme === 'dark' ? 90 : 0
                }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <Sun size={20} className="text-orange-500" />
            </motion.div>

            <motion.div
                initial={false}
                animate={{
                    scale: theme === 'dark' ? 1 : 0,
                    rotate: theme === 'dark' ? 0 : -90
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full h-full"
            >
                <Moon size={20} className="text-blue-400" />
            </motion.div>
            <div className="w-5 h-5" /> {/* Spacer to maintain size */}
        </button>
    );
}
