const mongoose = require('mongoose');

UserStatusSchema = new mongoose.Schema({
    id:{type: String,},
    userId:{type: String},
    timestamp:{type: Date,default: Date.now()},
    userStatus:{type: String, default: 'Undefined'},
}, {collection: 'userStatus'})

exports.UserStatusSchema = UserStatusSchema;