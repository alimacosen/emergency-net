const mongoose = require('mongoose');

ShelterRequestSchema = new mongoose.Schema({
    requestID: {type: String,},
    postID: {type: String,},
    senderID: {type: String,},
    senderName: {type: String,},
    requesterName: {type: String,},
    requesterID:{type: String,},
    approved: {type: Boolean, default: false},
    requestCreateDate: {type: Date, default: Date.now()},
    requestUpdateDate: {type: Date, default: Date.now()},
    description: {type: String,},
    totalRoomNumRequest: {type: Number, default: 1},
    roomIDs: [{roomID: String,}],
    totalPeople: {type: Number, default: 1},
    BookDateBegin: {type: Date, default: Date.now()},
    BookDateEnd: {type: Date, default: Date.now()},
}, {collection: 'shelter_request'})

exports.ShelterRequestSchema = ShelterRequestSchema;
