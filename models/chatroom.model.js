class ChatroomModel{
    mongoose;
  
    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    findChatroomByRoomId(roomId){
        return this.mongoose.findOne({ id: roomId }).exec();
    }

    findChatroomByUserIds(userId) {
        return this.mongoose.findOne({ userIds: { $all: userId } }).exec();
    }

    createChatroom(chatroom) {
        return this.mongoose.create(chatroom);
    }
    
    findChatroomByCreater(creater) {
        return this.mongoose.findOne({creater: creater}).exec();
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new ChatroomModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = ChatroomModel;