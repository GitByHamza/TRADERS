'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import Product from '@/models/Product';
import Sale from '@/models/Sale';

export async function getDashboardStats() {
    await dbConnect();

    const [
        totalClients,
        totalProducts,
        totalSalesCount,
        salesData
    ] = await Promise.all([
        Client.countDocuments(),
        Product.countDocuments(),
        Sale.countDocuments(),
        Sale.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalProfit: { $sum: "$totalProfit" }
                }
            }
        ])
    ]);

    const { totalRevenue, totalProfit } = salesData[0] || { totalRevenue: 0, totalProfit: 0 };

    return {
        totalClients,
        totalProducts,
        totalSalesCount,
        totalRevenue,
        totalProfit
    };
}

export async function getRecentSales() {
    await dbConnect();
    // Populate client name and first product name for quick display
    const sales = await Sale.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'name')
        .lean();

    return sales.map((sale: any) => ({
        id: sale._id.toString(),
        clientName: sale.client?.name || 'Unknown',
        amount: sale.totalAmount,
        date: sale.createdAt.toISOString(),
    }));
}

export async function getClients() {
    await dbConnect();
    const clients = await Client.find().sort({ createdAt: -1 }).lean();
    return clients.map((client: any) => ({
        ...client,
        _id: client._id.toString(),
        createdAt: client.createdAt.toISOString(),
        updatedAt: client.updatedAt.toISOString(),
    }));
}

export async function createClient(data: { name: string; contactInfo?: string; address?: string; notes?: string }) {
    await dbConnect();
    await Client.create(data);
    revalidatePath('/clients');
    revalidatePath('/sales'); // Dropdown needs update
    return { success: true };
}

export async function updateClient(id: string, data: { name: string; contactInfo?: string; address?: string; notes?: string }) {
    await dbConnect();
    await Client.findByIdAndUpdate(id, data);
    revalidatePath('/clients');
    revalidatePath('/sales');
    return { success: true };
}

export async function deleteClient(id: string) {
    await dbConnect();
    await Client.findByIdAndDelete(id);
    revalidatePath('/clients');
    revalidatePath('/sales');
    return { success: true };
}

export async function getProducts() {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return products.map((product: any) => ({
        ...product,
        _id: product._id.toString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    }));
}

export async function createProduct(data: any) {
    await dbConnect();
    await Product.create(data);
    revalidatePath('/inventory');
    revalidatePath('/sales'); // Dropdown needs update
    return { success: true };
}

export async function updateProduct(id: string, data: any) {
    await dbConnect();
    await Product.findByIdAndUpdate(id, data);
    revalidatePath('/inventory');
    revalidatePath('/sales');
    return { success: true };
}

export async function deleteProduct(id: string) {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath('/inventory');
    revalidatePath('/sales');
    return { success: true };
}

export async function getSales() {
    await dbConnect();
    const sales = await Sale.find()
        .sort({ createdAt: -1 })
        .populate('client', 'name')
        .populate('items.product', 'name type')
        .lean();

    return sales.map((sale: any) => ({
        ...sale,
        _id: sale._id.toString(),
        client: sale.client ? { ...sale.client, _id: sale.client._id.toString(), name: sale.client.name } : null,
        items: sale.items.map((item: any) => ({
            ...item,
            _id: item._id ? item._id.toString() : undefined,
            product: item.product ? { ...item.product, _id: item.product._id.toString() } : null
        })),
        createdAt: sale.createdAt.toISOString(),
        updatedAt: sale.updatedAt.toISOString(),
        date: sale.date.toISOString(),
    }));
}

export async function createSale(data: {
    clientId: string,
    items: { productId: string, quantity: number }[],
    cargoSlipInfo?: string,
    trackingNo?: string
}) {
    await dbConnect();

    let totalAmount = 0;
    let totalProfit = 0;
    const processedItems = [];

    // Validate and Process items
    for (const item of data.items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        // Stock validation removed as per user request
        // if (product.quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        // Deduct Stock
        product.quantity -= item.quantity;
        await product.save();

        const lineTotal = product.salePrice * item.quantity;
        const lineCost = product.costPrice * item.quantity;
        const lineProfit = lineTotal - lineCost;

        totalAmount += lineTotal;
        totalProfit += lineProfit;

        processedItems.push({
            product: product._id,
            quantity: item.quantity,
            salePriceAtTime: product.salePrice,
            costPriceAtTime: product.costPrice
        });
    }

    // Create Sale Record
    const sale = await Sale.create({
        client: data.clientId,
        items: processedItems,
        totalAmount,
        totalProfit,
        cargoSlipInfo: data.cargoSlipInfo || '',
        trackingNo: data.trackingNo || '',
        date: new Date()
    });

    revalidatePath('/sales');
    revalidatePath('/inventory'); // Stock update needs refresh
    revalidatePath('/'); // Dashboard stats update
    revalidatePath('/api/analytics'); // Chart data

    return { success: true, saleId: sale._id.toString() };
}
