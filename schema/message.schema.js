const mongoose = require('mongoose');

MessageSchema = new mongoose.Schema({
    id: {type: String,},
    chatRoomId: {type: String,},
    sender: {type: String,},
    senderId:{type: String,},
    receiver: {type: String, default: "All"},
    receiverId: {type: String, default: "All"},
    readOrNot: {type: Boolean, default: false},
    requestId: {type: String, default: "message"},
    requestResponse: {type: String, default: "None"},
    content: {type: String,},
    createDate: {type: Date, default: Date.now()},
    senderStatus: {type: String, default: 'Undefined'},
}, {collection: 'message'})


exports.MessageSchema = MessageSchema;
