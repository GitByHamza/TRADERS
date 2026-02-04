'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Search, X, Filter } from 'lucide-react';
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions';

interface Product {
    _id: string;
    name: string;
    type: string;
    costPrice: number;
    salePrice: number;
    quantity: number;
    attributes?: {
        sizeInches?: number;
        weightGrams?: number;
        ufValue?: string;
        wattValue?: string;
    };
}

export default function ProductTable({ initialProducts }: { initialProducts: Product[] }) {
    const router = useRouter();
    const [products, setProducts] = useState(initialProducts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<any>({
        name: '',
        type: 'HEAT_SINK',
        costPrice: '',
        salePrice: '',
        quantity: '',
        attributes: {
            sizeInches: '',
            weightGrams: '',
            ufValue: '',
            wattValue: ''
        }
    });

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                type: product.type,
                costPrice: product.costPrice,
                salePrice: product.salePrice,
                quantity: product.quantity,
                attributes: {
                    sizeInches: product.attributes?.sizeInches || '',
                    weightGrams: product.attributes?.weightGrams || '',
                    ufValue: product.attributes?.ufValue || '',
                    wattValue: product.attributes?.wattValue || ''
                }
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                type: 'HEAT_SINK',
                costPrice: '',
                salePrice: '',
                quantity: '',
                attributes: { sizeInches: '', weightGrams: '', ufValue: '', wattValue: '' }
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Clean up attributes based on type
        const finalData = { ...formData };
        if (finalData.type === 'HEAT_SINK') {
            delete finalData.attributes.ufValue;
            delete finalData.attributes.wattValue;
        } else if (finalData.type === 'CAPACITOR') {
            delete finalData.attributes.sizeInches;
            delete finalData.attributes.weightGrams;
        }

        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, finalData);
            } else {
                await createProduct(finalData);
            }
            setIsModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to delete product');
        }
    };

    const filteredProducts = initialProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || p.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="HEAT_SINK">Heat Sink</option>
                        <option value="CAPACITOR">Capacitor</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full md:w-auto justify-center"
                >
                    <Plus size={20} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                                <th className="px-3 py-2 md:px-6 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                                        {product.name}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium 
                      ${product.type === 'HEAT_SINK' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                product.type === 'CAPACITOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {product.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        {product.type === 'HEAT_SINK' && (
                                            <div className="flex flex-col text-[10px] md:text-xs">
                                                <span>Size: {product.attributes?.sizeInches} in</span>
                                                <span>Wt: {product.attributes?.weightGrams} g</span>
                                            </div>
                                        )}
                                        {product.type === 'CAPACITOR' && (
                                            <div className="flex flex-col text-[10px] md:text-xs">
                                                <span>{product.attributes?.ufValue} uF</span>
                                                <span>{product.attributes?.wattValue} W</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        {product.quantity}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        PKR {product.costPrice}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        PKR {product.salePrice}
                                    </td>
                                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingProduct ? 'Edit Product' : 'New Product'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="HEAT_SINK">Heat Sink</option>
                                        <option value="CAPACITOR">Capacitor</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Price</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                        value={formData.costPrice}
                                        onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                        value={formData.salePrice}
                                        onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Attributes</h3>

                                {formData.type === 'HEAT_SINK' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size (Inches)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                                value={formData.attributes.sizeInches}
                                                onChange={e => setFormData({ ...formData, attributes: { ...formData.attributes, sizeInches: e.target.value } })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (g)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                                value={formData.attributes.weightGrams}
                                                onChange={e => setFormData({ ...formData, attributes: { ...formData.attributes, weightGrams: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.type === 'CAPACITOR' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">uF Value</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                                value={formData.attributes.ufValue}
                                                onChange={e => setFormData({ ...formData, attributes: { ...formData.attributes, ufValue: e.target.value } })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Watt Value</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white"
                                                value={formData.attributes.wattValue}
                                                onChange={e => setFormData({ ...formData, attributes: { ...formData.attributes, wattValue: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.type === 'OTHER' && (
                                    <p className="text-sm text-gray-500 italic">No specific attributes.</p>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
