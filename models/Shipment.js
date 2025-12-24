const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true
    },
    sender: {
        name: String,
        address: String,
        contact: String
    },
    receiver: {
        name: String,
        address: String,
        contact: String
    },
    packageDetails: {
        weight: Number,
        packageType: String,
        description: String,
        price: Number
    },
    estimatedDelivery: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'],
        default: 'Booked'
    },
    currentLocation: {
        type: String,
        default: 'Origin'
    },
    deliveryProof: {
        type: String // URL or base64 string
    },
    history: [{
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Shipment', shipmentSchema);
