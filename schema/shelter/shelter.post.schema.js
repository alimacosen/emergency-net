const mongoose = require('mongoose');

ShelterPostSchema = new mongoose.Schema({
    postID: {type: String,},
    sender: {type: String,},
    senderId:{type: String,},
    assignees: [{
        assigneeName: {type: String},
        assigneeID: {type: String},
        roomNum: {type: Number},
        roomIDs: [{roomID: String,}]
    }],
    postCreateDate: {type: Date, default: Date.now()},
    postUpdateDate: {type: Date, default: Date.now()},
    description: {type: String,},
    totalRoomNum: {type: Number, default: 1},
    availableRoomNum: {type: Number, default: 1},
    roomInfo: [{
        roomID: {type: String},
        availableDateBegin: {type: Date, default: Date.now()
        },
        availableDateEnd: {type: Date, default: Date.now()
        },
        assigned: {type: Boolean, default: false},
    }],
    shelterAddress: {type: String,},
}, {collection: 'shelter_post'})

exports.ShelterPostSchema = ShelterPostSchema;
