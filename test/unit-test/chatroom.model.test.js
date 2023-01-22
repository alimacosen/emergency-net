const ChatroomModel = require("../../models/chatroom.model.js");
const mongoose = require('mongoose');
const MessageModel = require("../../models/message.model");
const ChatroomSchema = require('../../schema/chatroom.schema.js').ChatroomSchema;
const Chatroom = mongoose.model('chatroom', ChatroomSchema);
let chatroomModel = ChatroomModel.getInstance(Chatroom);

let chatRooms;

beforeEach(() => {
    chatRooms = [];
    jest.spyOn(Chatroom, 'findOne').mockImplementation(()=>{
        return chainMock;
    });
    jest.spyOn(Chatroom, 'create').mockImplementation((chatroom) => {
        chatRooms.push(chatroom);
    });
    const chainMock = {
        equals: jest.fn((userId) => {
            chatRooms = chatRooms.filter(room => room.userIds.includes(userId));
            return chainMock;
        }),
        exec: jest.fn(() => {
            return chatRooms[0];
        }),
    };
});

test('It should be able to create a message', () => {
    let mockChatRoom = {
        id: 'mockChatRoomId',
        userIds: ['userId1', 'userId2'],
        creater: 'creater'
    };
    chatroomModel.createChatroom(mockChatRoom);
    expect(chatRooms[0]).toBe(mockChatRoom);
});

test('It should be able to find a chatroom by user Id', () => {
    let mockChatRoom = {
        id: 'mockChatRoomId2',
        userIds: ['userId3', 'userId4'],
        creater: 'creater'
    };
    chatRooms.push(mockChatRoom);
    let room = chatroomModel.findChatroomByUserIds('userId3');
    expect(room).toBe(mockChatRoom);
    room = chatroomModel.findChatroomByUserIds('userId4');
    expect(room).toBe(mockChatRoom);
});

test('It should be able to find a chatroom by creater', () => {
    let mockChatRoom = {
        id: 'mockChatRoomId',
        userIds: ['userId1', 'userId2'],
        creater: 'mockCreater'
    };
    chatRooms.push(mockChatRoom);
    let room = chatroomModel.findChatroomByCreater('mockCreater');
    expect(room).toBe(mockChatRoom);
})

test('It should create one and only one instance', () => {
    let newChatroomModel = ChatroomModel.getInstance(Chatroom);
    expect(chatroomModel).toBe(newChatroomModel);
});