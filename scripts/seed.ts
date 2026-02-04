
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env.local') });

// Schema Definitions (Copying/Importing models directly to avoid alias issues in standalone script)
// It's often safer to re-define or use relative imports effectively, but for a script, simplified inline models or relative imports work.
// Let's try relative imports first, assuming tsx handles tsconfig paths if configured, but relative is foolproof.

import User from '../models/User';
import Client from '../models/Client';
import Product from '../models/Product';
import Sale from '../models/Sale';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected!');

        console.log('Clearing existing data...');
        await Client.deleteMany({});
        await Product.deleteMany({});
        await Sale.deleteMany({});
        // We intentionally DO NOT delete Users so the admin account remains.

        console.log('Seeding Clients...');
        const clients = await Client.insertMany([
            { name: 'ElectroTech Solutions', contactInfo: '0300-1234567', address: 'Shop 12, Hall Road, Lahore', notes: 'Regular buyer of capacitors' },
            { name: 'Alpha Electronics', contactInfo: '0321-9876543', address: 'Office 4, Sadar, Rawalpindi', notes: 'Needs VAT invoices' },
            { name: 'Cooling Systems PK', contactInfo: 'info@coolingsys.pk', address: 'Industrial Estate, Karachi', notes: 'Bulk buyer of heat sinks' },
            { name: 'Ahmed Traders', contactInfo: '0333-5555555', address: 'College Road, Multan', notes: '' },
            { name: 'Fast Repair Lab', contactInfo: '0345-1122334', address: 'Gulberg III, Lahore', notes: 'Small quantities, high frequency' },
        ]);

        console.log('Seeding Products...');
        const products = await Product.insertMany([
            // Heat Sinks
            {
                name: 'Aluminum Heat Sink Large',
                type: 'HEAT_SINK',
                costPrice: 150,
                salePrice: 250,
                quantity: 500,
                attributes: { sizeInches: 8.5, weightGrams: 200 }
            },
            {
                name: 'CPU Cooler Sink',
                type: 'HEAT_SINK',
                costPrice: 80,
                salePrice: 150,
                quantity: 1200,
                attributes: { sizeInches: 3.5, weightGrams: 85 }
            },
            {
                name: 'Industrial Fin Sink',
                type: 'HEAT_SINK',
                costPrice: 400,
                salePrice: 750,
                quantity: 150,
                attributes: { sizeInches: 12.0, weightGrams: 650 }
            },

            // Capacitors
            {
                name: 'Ceramic Capacitor 10uF',
                type: 'CAPACITOR',
                costPrice: 5,
                salePrice: 15,
                quantity: 5000,
                attributes: { ufValue: '10', wattValue: '0.5' }
            },
            {
                name: 'Electrolytic Capacitor 1000uF',
                type: 'CAPACITOR',
                costPrice: 25,
                salePrice: 45,
                quantity: 2000,
                attributes: { ufValue: '1000', wattValue: '1' }
            },
            {
                name: 'High Voltage Cap',
                type: 'CAPACITOR',
                costPrice: 150,
                salePrice: 300,
                quantity: 300,
                attributes: { ufValue: '220', wattValue: '10' }
            },

            // Other
            {
                name: 'Thermal Paste Syringe',
                type: 'OTHER',
                costPrice: 120,
                salePrice: 250,
                quantity: 100
            }
        ]);

        console.log('Seeding Sales...');

        // Create some historical sales
        const salesData = [];
        const today = new Date();

        for (let i = 0; i < 20; i++) {
            const randomClient = clients[Math.floor(Math.random() * clients.length)];
            // Pick 1-3 random products
            const numItems = Math.floor(Math.random() * 3) + 1;
            const currentItems = [];
            let totalAmount = 0;
            let totalProfit = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 10) + 1;

                // Snapshot prices
                const salePrice = randomProduct.salePrice;
                const costPrice = randomProduct.costPrice;

                const lineTotal = salePrice * qty;
                const lineProfit = lineTotal - (costPrice * qty);

                totalAmount += lineTotal;
                totalProfit += lineProfit;

                currentItems.push({
                    product: randomProduct._id,
                    quantity: qty,
                    salePriceAtTime: salePrice,
                    costPriceAtTime: costPrice
                });

                // Note: We are not updating stock in this seed loop to keep logic simple, 
                // but in real app logic we do. The products created above have static stock.
            }

            const saleDate = new Date(today);
            saleDate.setDate(today.getDate() - Math.floor(Math.random() * 30)); // Past 30 days

            salesData.push({
                client: randomClient._id,
                items: currentItems,
                totalAmount,
                totalProfit,
                date: saleDate,
                cargoSlipInfo: Math.random() > 0.3 ? (Math.random() > 0.5 ? 'Leopard Courier' : 'TCS') : '', // 70% chance of cargo
                trackingNo: Math.random() > 0.3 ? `TRK-${Math.floor(Math.random() * 100000)}` : ''
            });
        }

        await Sale.insertMany(salesData);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
