import { getSales, getClients, getProducts } from '@/lib/actions';
import SalesClient from '@/components/SalesClient';

export default async function SalesPage() {
    const [sales, clients, products] = await Promise.all([
        getSales(),
        getClients(),
        getProducts()
    ]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales</h1>
                <p className="text-gray-500 dark:text-gray-400">Record and view transactions</p>
            </div>

            <SalesClient sales={sales} clients={clients} products={products} />
        </div>
    );
}
