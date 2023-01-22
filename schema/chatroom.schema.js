const mongoose = require('mongoose');

ChatroomSchema = new mongoose.Schema({
    id: {type: String,},
    userIds: Array,
    creater: String,
}, {collection: 'chatroom'})


exports.ChatroomSchema = ChatroomSchema;