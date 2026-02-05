'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AnalyticsData {
    date: string;
    revenue: number;
    profit: number;
}

export default function RevenueProfitChart() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data, isLoading, isError } = useQuery({
        queryKey: ['analytics', format(currentDate, 'yyyy-MM')],
        queryFn: async () => {
            const res = await fetch(`/api/analytics?date=${currentDate.toISOString()}`);
            if (!res.ok) throw new Error('Network response was not ok');
            const json = await res.json();
            return json.data as AnalyticsData[];
        },
    });

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const totalRevenue = data?.reduce((acc, curr) => acc + curr.revenue, 0) || 0;
    const totalProfit = data?.reduce((acc, curr) => acc + curr.profit, 0) || 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue & Profit Analytics</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly performance overview</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="font-semibold text-gray-900 dark:text-white min-w-[100px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all shadow-sm"
                        disabled={new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear()}
                    >
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300 disabled:opacity-30" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">PKR {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Total Profit</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">PKR {totalProfit.toLocaleString()}</p>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-4">
                <div className="h-[300px] md:h-[400px] min-w-[600px] md:min-w-[800px]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : isError ? (
                        <div className="h-full flex items-center justify-center text-red-500">
                            Failed to load data
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickMargin={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#111827' }}
                                    cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Revenue"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#16a34a"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorProfit)"
                                    name="Profit"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
