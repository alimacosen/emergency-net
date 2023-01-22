const mongoose = require('mongoose');

EmergencySupplyRequestSchema = new mongoose.Schema({
    id: {type: String,},
    requesterId:{type: String,},
    providerId:{type: String,},
    requester: {type: String,},
    provider: {type: String,},
    type: {type: String,},
    quantity: {type: String,},
    response: {type: String, default: "None"},
    createDate: {type: Date, default: Date.now()},
}, {collection: 'emergencySupplyRequest'})

exports.EmergencySupplyRequestSchema = EmergencySupplyRequestSchema;
