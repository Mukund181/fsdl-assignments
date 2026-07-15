const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    seatNumber: { type: Number, required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    bookedOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
