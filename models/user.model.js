const JWTToken = require('../middlewares/JWTToken.js');

class UserModel {
    mongoose;

    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    addUser(user) {
        return this.mongoose.create(user);
    }

    findAllUsers(){
        return this.mongoose.find().sort({username: 1}).exec();
    }

    async findUserWithStatus(filter){
        // get all online users
        let onlineUsers = await this.mongoose.find(filter, { userId: 1, username: 1, activeStatus: 1, userStatus: 1, accountStatus: 1}).where('activeStatus').equals(true).where('accountStatus').equals(true).sort({username: 1}).exec();
        // get all offline users
        let offlineUsers = await this.mongoose.find(filter, { userId: 1, username: 1, activeStatus: 1, userStatus: 1, accountStatus: 1}).where('activeStatus').equals(false).where('accountStatus').equals(true).sort({username: 1}).exec();
    
        return {
            onlineUsers: onlineUsers,
            offlineUsers: offlineUsers,
        }
    }

    findUserByZipcode(zipcode) {
        return this.mongoose.find({zipcode: zipcode}).exec();
    }

    findBannedUsers(filter) {
        return this.mongoose.find(filter).exec();
    }

    findUserById(userId){
        return this.mongoose.findOne({userId: userId}).exec();
    }

    findUser(username) {
        return this.mongoose.findOne({username: username}).exec();
    }
    
    async login(username, password) {
        const user = await this.mongoose.findOne({ username });
        if (user && await user.confirmPassword(password)) {
            if (!user.accountStatus){
                return {user: "banned", exists: true}
            }
            const token = await JWTToken.generateAccessToken(user.userId);
            user.token = token;
            return {user, exists: true};
        }
        if (user){
            return {user, exists: false};
        }
        return {user: null, exists: true};
    }
    
    setUserAck(userId, ackStatus) {
        return this.mongoose.findOneAndUpdate({userId: userId}, {ackStatement: ackStatus}).exec();
    }
    
    async setUserActStatus(userId, activeStatus) {
        let res = this.mongoose.findOneAndUpdate({userId: userId}, {activeStatus: activeStatus}).exec();
        if (res == null) {
            return false
        }
        return true
    }

    async asyncFindUserById(userId) {
        return this.mongoose.findOne({userId: userId}).exec();
    }

    setUserCurrentStatus(userId, userStatus) {
        return this.mongoose.findOneAndUpdate({userId: userId}, {userStatus: userStatus}).exec();
    }

    setUserZipcodeLocation(userId, zipcode) {
        return this.mongoose.findOneAndUpdate({userId: userId}, {zipcode: zipcode}).exec();
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new UserModel(mongoose);
        }
        return this.instance;
    }

    // emergency contact
    async updateEmail(userId, userEmail) {
        let res = this.mongoose.findOneAndUpdate({userId: userId}, {userEmail: userEmail}).exec();

        if (res == null) {
            return false
        }
        return true
    }

    async removeContact(userId, userName) {
        let res = this.mongoose.updateOne({userId: userId}, {$pull: {emergencyContact: {userName: userName}}}).exec();

        if (res == null) {
            return false
        }
        return true
    }

    async addContact(senderId, receiverName, receiverId) {
        let res = this.mongoose.updateOne({userId: senderId}, {$push: {emergencyContact: {userName: receiverName, userId: receiverId}}, $pull: {pendingEmergencyContact: receiverName}}).exec();

        if (res == null) {
            return false
        }
        return true
    }

    async addReceiverRequest(userId, request) {
        let res =  this.mongoose.updateOne({userId: userId}, {$push: {emergencyRequest: request}}).exec();

        if (res == null) {
            return false
        }
        return true
    }

    async addPendingEC(userId, username){
        let res =  this.mongoose.updateOne({userId: userId}, {$push: {pendingEmergencyContact: username}}).exec();

        if (res == null) {
            return false
        }
        return true
    }

    async removePendingEC(userId, username){
        let res =  this.mongoose.updateOne({userId: userId}, {$pull: {pendingEmergencyContact: username}}).exec();

        if (res == null) {
            return false
        }
        return true
    }

    async responseContact(senderId, receiverId){
        let res =  this.mongoose.updateOne({userId: receiverId}, {$pull: {emergencyRequest: {senderId: senderId}}}).exec();

        if (res == null) {
            return false
        }
        return true
    }

    async updateUser(userId, update){
        let res =  this.mongoose.findOneAndUpdate({userId: userId}, update).exec();

        if (res == null) {
            return false
        }
        return true
    }
}

module.exports = UserModel;