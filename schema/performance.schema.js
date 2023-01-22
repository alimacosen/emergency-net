const mongoose = require('mongoose');

PerformanceSchema = new mongoose.Schema({
    id: {type: String,},
    duration: {type: Number,},
    interval: {type: Number,},
    postNumPerSec: {type: String,},
    getNumPerSec: {type: String,},
    conductor: {type: String,},
    createDate: {type: Date, default: Date.now()},
}, {collection: 'performance'})


exports.PerformanceSchema = PerformanceSchema;