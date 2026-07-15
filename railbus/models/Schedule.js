const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    type: { type: String, enum: ['rail', 'bus'], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    departure: { type: Date, required: true },
    arrival: { type: Date, required: true },
    price: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    infraManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Owner of this bus/train instance
});

module.exports = mongoose.model('Schedule', scheduleSchema);
