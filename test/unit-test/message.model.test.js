const MessageModel = require("../../models/message.model.js");
const mongoose = require('mongoose');
const PerformanceModel = require("../../models/performance.model");
const MessageSchema = require('../../schema/message.schema.js').MessageSchema;
const Message = mongoose.model('message', MessageSchema);
let messageModel = MessageModel.getInstance(Message);

let messages;
let chainMock;

beforeAll(async () => {
    messages = [];
});

beforeEach(() => {
    jest.spyOn(Message, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        where: jest.fn((attribute) => {
            return chainMock;
        }),
        equals: jest.fn((roomID) => {
            messages = messages.filter(item=>item.roomId === roomID);
            return chainMock;
        }),
        sort: jest.fn(() => {
            messages.sort(function(a, b) {
                return a.createDate-b.createDate;
            });
            return chainMock;
        }),
        limit: jest.fn((num) => {
            messages = messages.slice(0, num);
            return chainMock;
        }),
        exec: jest.fn(() => {
            return messages;
        }),
    };
});

test('It should be able to save a message', ()=>{

    let spy = jest.spyOn(Message, 'create').mockImplementation((m)=>{
        messages.push(m);
    });

    let message = {
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        roomId: '666',
        sender: 'TestUser',
        content: 'no',
        createDate: 1647047122477,
        senderStatus: 'I need HELP',
    };
    messageModel.createMessage(message);
    expect(messages[0]).toBe(message);

});

test('It should be able to read all messages for public room', ()=>{
    messages = [{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        roomId: '666',
        sender: 'TestUser',
        content: 'no',
        createDate: 1647047122477,
        senderStatus: 'I need HELP',
    }];

    expect(messageModel.readMessages('666', {})).toBe(messages);
});

test('Messages should be sorted by createDate', ()=>{
    messages = [{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        roomId: '666',
        sender: 'TestUser',
        content: 'no',
        createDate: 1647047122477,
        senderStatus: 'I need HELP',
    },{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        roomId: '666',
        sender: 'TestUser',
        content: 'no',
        createDate: 1647047122479,
        senderStatus: 'I need HELP',
    },{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        roomId: '666',
        sender: 'TestUser',
        content: 'no',
        createDate: 1647047122478,
        senderStatus: 'I need HELP',
    }];

    messageModel.readMessages('666', {});
    expect(messages[0].createDate).toBe(1647047122477);
    expect(messages[1].createDate).toBe(1647047122478);
    expect(messages[2].createDate).toBe(1647047122479);
});

test('It should read maximum 50 messages for public room', ()=>{
    let temp = {
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        roomId: '666',
        sender: 'kenlu',
        content: 'no',
        createDate: 1647047122477,
        senderStatus: 'I need HELP',
    };

    for (let i = 0; i < 100; i ++){
        messages.push(temp);
    }

    messageModel.readMessages('666', {});
    expect(messages.length).toBe(50);
});

test('It should be able to get user unread messages', () => {
    jest.spyOn(Message, 'find').mockImplementation((filter)=>{
        messages = messages.filter(item =>
            item.receiverId === filter.receiverId && item.readOrNot === filter.readOrNot);
        return chainMock;
    });

    messages = [{
        id: 'mockId',
        receiverId: 'userId1',
        readOrNot: true
    },
    {
        id: 'mockId',
        receiverId: 'userId1',
        readOrNot: false
    }];
    let unreadMessages = messageModel.checkUnreadMessages('userId1');
    expect(unreadMessages).toHaveLength(1);
    expect(unreadMessages[0]).toBe(messages[0]);
});

test('It should be able to update a unread message to read', () => {
    jest.spyOn(Message, 'updateMany').mockImplementation((condition)=>{
        messages
            .filter( m =>
                condition.chatRoomId === m.chatRoomId && condition.receiver === m.receiver)
            .forEach( m => m.readOrNot = true);
    });
    messages = [{
        id: 'mockId1',
        chatRoomId: 'chatRoom1',
        receiver: 'user1',
        readOrNot: true
    },
    {
        id: 'mockId2',
        chatRoomId: 'chatRoom2',
        receiver: 'user1',
        readOrNot: false
    }];
    let mockCondition = {
        chatRoomId: 'chatRoom2',
        receiver: 'user1'
    }
    messageModel.updateUnreadMessages(mockCondition);
    expect(messages[1].readOrNot).toBe(true);
});

test('It should be able to update the request response of a message.', () => {
    jest.spyOn(Message, 'findOneAndUpdate').mockImplementation((filter,update)=>{
        messages
            .filter( m =>
                filter.requestId === m.requestId)
            .forEach( m => m.requestResponse = update.requestResponse);
    });
    messages = [{
        id: 'mockId1',
        chatRoomId: 'chatRoom1',
        receiver: 'user1',
        requestId: '12345678',
        requestResponse: 'None',
        readOrNot: true
    },
    {
        id: 'mockId2',
        chatRoomId: 'chatRoom2',
        receiver: 'user1',
        requestId: '45678990',
        requestResponse: 'None',
        readOrNot: false
    }];
    let mockFilter = {
        requestId: '12345678',
    }
    let mockUpdate = {
        requestResponse: 'Approve',
    }
    messageModel.updateResponse(mockFilter,mockUpdate);
    expect(messages[0].requestResponse).toBe(mockUpdate.requestResponse);
});

test('It should be able to find latest messages between two users', () => {
    jest.spyOn(Message, 'find').mockImplementation((condition)=>{
        messages = mockMessages.filter(item =>
            condition.receiver === item.receiver && condition.sender === item.sender);
        return chainMock;
    });

    let mockMessages = [{
        id: 'mockId',
        sender: 'user1',
        receiver: 'user2',
        createDate: Date.now()
    },
    {
        id: 'mockId',
        sender: 'user2',
        receiver: 'user1',
        createDate: Date.now()
    }];
    let mockCondition = {
        sender: 'user2',
        receiver: 'user1'
    }
    let latestMessages = messageModel.findlatestMessages(mockCondition);
    expect(latestMessages).toHaveLength(1);
    expect(latestMessages[0]).toBe(mockMessages[1]);
})

test('It should create one and only one instance', () => {
    let newMessageModel = MessageModel.getInstance(Message);
    expect(messageModel).toBe(newMessageModel);
});