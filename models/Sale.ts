import mongoose, { Schema, model, models } from 'mongoose';

const SaleItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    salePriceAtTime: {
        type: Number, // Snapshot of price at sale
        required: true,
    },
    costPriceAtTime: {
        type: Number, // Snapshot of cost at sale
        required: true,
    }
});

const SaleSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    items: [SaleItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    totalProfit: {
        type: Number,
        required: true,
    },
    cargoSlipInfo: { type: String, default: '' },
    trackingNo: { type: String, default: '' },
    date: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Sale = models.Sale || model('Sale', SaleSchema);

export default Sale;
