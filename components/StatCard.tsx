import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: string; // e.g., "blue", "green"
}

export default function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                <div className={cn("p-2 rounded-lg", colorStyles[color as keyof typeof colorStyles])}>
                    <Icon size={20} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                {trend && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
}
