const mongoose = require('mongoose');

AnnouncementSchema = new mongoose.Schema({
    id: {type: String,},
    senderId:{type: String,},
    sender: {type: String,},
    senderStatus: {type: String, default: 'Undefined'},
    content: {type: String,},
    createDate: {type: Date, default: Date.now()},
}, {collection: 'announcement'})


exports.AnnouncementSchema = AnnouncementSchema;
