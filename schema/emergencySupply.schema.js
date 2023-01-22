const mongoose = require('mongoose');

EmergencySupplySchema = new mongoose.Schema({
    id: {type: String,},
    provider: {type: String,},
    providerId:{type: String,},
    type: {type: String,},
    quantity: {type: String,},
    lastModifiedDate: {type: Date, default: Date.now()},
}, {collection: 'emergencySupply'})

exports.EmergencySupplySchema = EmergencySupplySchema;
