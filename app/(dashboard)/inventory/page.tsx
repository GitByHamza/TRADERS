import { getProducts } from '@/lib/actions';
import ProductTable from '@/components/ProductTable';

export default async function InventoryPage() {
    const products = await getProducts();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your product stock</p>
            </div>

            <ProductTable initialProducts={products} />
        </div>
    );
}
