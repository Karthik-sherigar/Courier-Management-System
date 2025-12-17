const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/shipments
// @desc    Create a new shipment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { sender, receiver, packageDetails, userId } = req.body;

        // Generate random Tracking ID
        const trackingId = 'TRK' + Math.floor(100000 + Math.random() * 900000);

        const shipment = await Shipment.create({
            trackingId,
            sender,
            receiver,
            packageDetails,
            createdBy: userId, // Optional if we enforce auth
            history: [{
                status: 'Booked',
                location: 'Origin',
                timestamp: new Date()
            }]
        });

        res.status(201).json(shipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/shipments/track/:id
// @desc    Track shipment by ID
// @access  Public
router.get('/track/:id', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ trackingId: req.params.id });

        if (shipment) {
            res.json(shipment);
        } else {
            res.status(404).json({ message: 'Shipment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/shipments/user/:userId
// @desc    Get user shipments
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const shipments = await Shipment.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
        res.json(shipments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/shipments
// @desc    Get all shipments (Admin)
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
    try {
        const shipments = await Shipment.find({}).sort({ createdAt: -1 });
        res.json(shipments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/shipments/:id/status
// @desc    Update shipment status
// @access  Private (Staff/Admin)
router.put('/:id/status', protect, async (req, res) => {
    const { status, location, deliveryProof } = req.body;
    try {
        const shipment = await Shipment.findOne({ trackingId: req.params.id });

        if (shipment) {
            shipment.status = status;
            shipment.currentLocation = location || shipment.currentLocation;
            if (deliveryProof) shipment.deliveryProof = deliveryProof;

            shipment.history.push({
                status: status,
                location: location || shipment.currentLocation,
                timestamp: new Date()
            });

            const updatedShipment = await shipment.save();
            res.json(updatedShipment);
        } else {
            res.status(404).json({ message: 'Shipment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
