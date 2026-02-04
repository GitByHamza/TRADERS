import { getClients } from '@/lib/actions';
import ClientTable from '@/components/ClientTable';

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your client database</p>
            </div>

            <ClientTable initialClients={clients} />
        </div>
    );
}
