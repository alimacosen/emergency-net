class MessageModel {
    mongoose;
  
    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    setStrategy(mongoose){
        this.mongoose = mongoose;
    }

    createMessage(message) {
        return this.mongoose.create(message);
    }

    readMessages(roomId, filter) {
        filter.chatRoomId = roomId;
        return this.mongoose.find(filter).sort({createDate: -1}).limit(50).exec();
    }

    checkUnreadMessages(receiverId){
        return this.mongoose.find({receiverId: receiverId, readOrNot: false}).exec();
    }
    
    updateUnreadMessages(conditions){
        return this.mongoose.updateMany(conditions, { $set: { readOrNot: true } });
    }

    updateResponse(filter,update) {
        return this.mongoose.findOneAndUpdate(filter, update);
    }


    findlatestMessages(conditions){
        return this.mongoose.find(conditions).sort({createDate: -1}).limit(99).exec();
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new MessageModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = MessageModel;
