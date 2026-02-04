'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { createSale } from '@/lib/actions';

// Types
interface Product {
    _id: string;
    name: string;
    salePrice: number;
    costPrice: number;
    quantity: number;
}
interface Client {
    _id: string;
    name: string;
}
// We will receive products and clients as props to select from 
// (Passed from server component wrapper)

export default function SalesClient({
    sales,
    clients,
    products
}: {
    sales: any[],
    clients: Client[],
    products: Product[]
}) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // New Sale Form State
    const [selectedClientId, setSelectedClientId] = useState('');
    const [cart, setCart] = useState<{ productId: string; name: string; price: number; costPrice: number; quantity: number }[]>([]);

    // Item adding state
    const [currentProductId, setCurrentProductId] = useState('');
    const [currentQty, setCurrentQty] = useState(1);

    // Cargo Info State
    const [cargoInfo, setCargoInfo] = useState('');
    const [trackingNo, setTrackingNo] = useState('');

    const handleAddItem = () => {
        if (!currentProductId || currentQty < 1) return;
        const product = products.find(p => p._id === currentProductId);
        if (!product) return;

        if (!product) return;

        // Stock validation removed
        // if (currentQty > product.quantity) {
        //     alert(`Only ${product.quantity} in stock!`);
        //     return;
        // }

        setCart([...cart, {
            productId: product._id,
            name: product.name,
            price: product.salePrice,
            costPrice: product.costPrice,
            quantity: currentQty
        }]);

        setCurrentProductId('');
        setCurrentQty(1);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleSubmit = async () => {
        if (!selectedClientId || cart.length === 0) return;
        setLoading(true);
        try {
            await createSale({
                clientId: selectedClientId,
                items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
                cargoSlipInfo: cargoInfo,
                trackingNo: trackingNo
            });
            setIsModalOpen(false);
            setCart([]);
            setSelectedClientId('');
            setCargoInfo('');
            setTrackingNo('');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to create sale');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search sales..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus size={20} />
                    <span>New Sale</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cargo Info</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tracking No</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {sales.map((sale) => (
                                <tr key={sale._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(sale.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                                        {sale.client?.name || 'Deleted Client'}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        {sale.items.length} items
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                                        PKR {sale.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        PKR {(sale.totalAmount - sale.totalProfit).toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                        {sale.cargoSlipInfo || '-'}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                        {sale.trackingNo || '-'}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">
                                        PKR {sale.totalProfit.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No sales recorded
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Sale Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">New Transaction</h2>

                        <div className="space-y-6">
                            {/* Select Client */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Client</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                >
                                    <option value="">-- Choose Client --</option>
                                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            {/* Add Items Section */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-4">
                                <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <ShoppingCart size={18} /> Add Products
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <select
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={currentProductId}
                                            onChange={(e) => setCurrentProductId(e.target.value)}
                                        >
                                            <option value="">-- Choose Product --</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} (Qty: {p.quantity}) - PKR {p.salePrice}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Qty"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white"
                                            value={currentQty}
                                            onChange={(e) => setCurrentQty(parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddItem}
                                        disabled={!currentProductId}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Cart Summary */}
                            {cart.length > 0 && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Product</th>
                                                <th className="px-4 py-2 text-left">Qty</th>
                                                <th className="px-4 py-2 text-left">Cost</th>
                                                <th className="px-4 py-2 text-left">Sale Price</th>
                                                <th className="px-4 py-2 text-right">Total</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {cart.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 dark:text-gray-300">{item.name}</td>
                                                    <td className="px-4 py-2 dark:text-gray-300">{item.quantity}</td>
                                                    <td className="px-4 py-2 dark:text-gray-300">{item.costPrice}</td>
                                                    <td className="px-4 py-2 dark:text-gray-300">{item.price}</td>
                                                    <td className="px-4 py-2 text-right font-medium dark:text-white">
                                                        {(item.price * item.quantity).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold">
                                            <tr>
                                                <td colSpan={4} className="px-4 py-3 text-right text-gray-900 dark:text-white">Total Amount:</td>
                                                <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">
                                                    PKR {totalAmount.toLocaleString()}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cargo / Builty Info</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Leopard, TCS"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white"
                                        value={cargoInfo}
                                        onChange={(e) => setCargoInfo(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking / Builty No</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TRK-123456"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white"
                                        value={trackingNo}
                                        onChange={(e) => setTrackingNo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || cart.length === 0 || !selectedClientId}
                                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-semibold"
                                >
                                    {loading ? 'Processing...' : 'Complete Sale'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
