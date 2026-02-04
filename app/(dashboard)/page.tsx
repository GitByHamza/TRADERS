import { getDashboardStats, getRecentSales } from '@/lib/actions';
import StatCard from '@/components/StatCard';
import RevenueProfitChart from '@/components/RevenueProfitChart';
import { Users, Package, DollarSign, TrendingUp } from 'lucide-react';

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const recentSales = await getRecentSales();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Overview of your business performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`PKR ${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Total Profit"
                    value={`PKR ${stats.totalProfit.toLocaleString()}`}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="Total Clients"
                    value={stats.totalClients}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="orange"
                />
            </div>

            <div className="mb-8">
                <RevenueProfitChart />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Sales</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.clientName}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        PKR {sale.amount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(sale.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {recentSales.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No recent sales found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
