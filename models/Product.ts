import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['HEAT_SINK', 'CAPACITOR', 'OTHER'],
        required: true,
    },
    costPrice: {
        type: Number,
        required: true,
    },
    salePrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        default: 0,
        required: true,
    },
    // Specific attributes
    attributes: {
        // Heat Sink specific
        sizeInches: { type: Number }, // Can be decimal
        weightGrams: { type: Number },

        // Capacitor specific
        ufValue: { type: String },
        wattValue: { type: String },
    },
}, { timestamps: true });

const Product = models.Product || model('Product', ProductSchema);

export default Product;
