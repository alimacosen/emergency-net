const mongoose = require('mongoose');

RescueSchema = new mongoose.Schema({
    id: {type: String,},
    citizenId: {type: String,},
    citizenName: {type: String},
    place: {type: String,},
    citizenLongitude: {type: Number,},
    citizenLatitude: {type: Number,},
    rescuerId: {type: String,},
    rescuerName: {type: String},
    rescuerLongitude: {type: Number,},
    rescuerLatitude: {type: Number,},
    rescueStatus: {type: Number, default: 0},
    createDate: {type: Date, default: Date.now()},
    updateDate: {type: Date, default: Date.now()},
}, {collection: 'rescue'})


exports.RescueSchema = RescueSchema;