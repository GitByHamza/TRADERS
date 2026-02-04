import mongoose, { Schema, model, models } from 'mongoose';

const ClientSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    contactInfo: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual to calculate total spent could be added here if we aggregate sales
// For now, we'll keep it simple data storage.

const Client = models.Client || model('Client', ClientSchema);

export default Client;
