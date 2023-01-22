const mongoose = require('mongoose');
const saltRounds = 10;
const bcrypt = require('bcryptjs');

UserSchema = new mongoose.Schema({
    userId: {type: String,},
    username: {type: String},
    password: {type: String},
    createDate: {type: Date, default: Date.now()},
    ackStatement: {type: Boolean, default: false},
    activeStatus: {type: Boolean, default: false},
    userStatus: {type: String, default: 'Undefined'},
    userRole: {type: String, default: 'Citizen'},
    zipcode: {type: String},
    userEmail: {type: String, default: 'name@example.com'},
    emergencyContact:{type: Array, items: {type: Object, properties: {userId: {type: String,}, userName: {type: String,}}}},
    pendingEmergencyContact: {type: Array},
    emergencyRequest:{type: Array, items: {type: Object,properties: {senderId: {type: String,},senderName: {type: String,},receiverId: {type: String,},receiverName: {type: String,}}}},
    accountStatus: { type: Boolean, default: true}
}, {collection: 'user'})

UserSchema.pre("save",async function(next){
    try {
        var user = this;
        if (!user.isModified("password")){
            return next();
        }
        user.password = await bcrypt.hash(user.password, saltRounds);
        return next();
    } catch(err){
        return next(error);
    }
});

UserSchema.methods.confirmPassword = async function(password){
    const result = await bcrypt.compare(password, this.password);
    return result;
};

exports.UserSchema = UserSchema;