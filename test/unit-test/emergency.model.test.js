const { v4: uuid } = require('uuid');
const UserModel = require("../../models/user.model.js");
const mongoose = require('mongoose');
const UserSchema = require('../../schema/user.schema.js').UserSchema;
const User = mongoose.model('user', UserSchema);
let userModel = UserModel.getInstance(User);

const ChatroomModel = require("../../models/chatroom.model.js");
const ChatroomSchema = require('../../schema/chatroom.schema.js').ChatroomSchema;
const Chatroom = mongoose.model('chatroom', ChatroomSchema);
let chatroomModel = ChatroomModel.getInstance(Chatroom);

let users;
let chatRooms;

beforeAll(async () => {
    users = [];
    chatRooms = [];
});

test('It should be able to update email for the user', ()=>{
    jest.spyOn(User, 'findOneAndUpdate').mockImplementation((userId, userEmail)=>{
        users.filter( u => userId.userId === u.userId).forEach(u => u.userEmail = userEmail.userEmail)
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return users;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        userEmail: 'name@example.com'
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        userEmail: 'user2@example.com'
    }];

    userModel.updateEmail('2fbcf4a7-05dc-483d-a83d-a9558eacc56c', 'new@email.com');
    expect(users[0].userEmail).toBe('new@email.com');
});

test('It should be unable to find the user and update email', ()=>{
    jest.spyOn(User, 'findOneAndUpdate').mockImplementation((userId, userEmail)=>{
        users.filter( u => userId.userId === u.userId).forEach(u => u.userEmail = userEmail.userEmail)
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return null;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        userEmail: 'name@example.com'
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        userEmail: 'user2@example.com'
    }];

    userModel.updateEmail('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', 'new@email.com');
    expect(users[0].userEmail).toBe('name@example.com');
});

test('It should be able to remove emergency contact from the user', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var emergencyContact = userlist[i].emergencyContact
                for (var j in emergencyContact){
                    if(emergencyContact[j].userName === userName['$pull'].emergencyContact.userName){
                        users[i].emergencyContact.splice(j)
                        return chainMock;
                    }
                }
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return users;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[{
            userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
            userName: 'TestNewUser2'
        }]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2'
    }];

    userModel.removeContact('2fbcf4a7-05dc-483d-a83d-a9558eacc56c', 'TestNewUser2');
    expect(users[0].emergencyContact).toStrictEqual([]);
});

test('It should not be able to find the user and remove emergency contact', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var emergencyContact = userlist[i].emergencyContact
                for (var j in emergencyContact){
                    if(emergencyContact[j].userName === userName['$pull'].emergencyContact.userName){
                        users[i].emergencyContact.splice(j)
                        return chainMock;
                    }
                }
            }
        } 
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return null;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[{
            userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
            userName: 'TestNewUser2'
        }]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2'
    }];

    userModel.removeContact('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', 'TestNewUser2');
    expect(users[0].emergencyContact).toStrictEqual([{
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        userName: 'TestNewUser2'
    }]);
});

test('It should be able to add new emergency contact to the user', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var pendingEmergencyContact = userlist[i].pendingEmergencyContact;
                var username = userName['$push'].emergencyContact.userName;
                var userid = userName['$push'].emergencyContact.userId;
                users[i].emergencyContact.push({userId: userid, userName: username})
                for (var j in pendingEmergencyContact){
                    if(pendingEmergencyContact[j] === username){
                        users[i].pendingEmergencyContact.splice(j, 1)
                        return chainMock;
                    }
                }
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return users;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: ['TestNewUser2']
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2'
    }];

    let user = [{
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        userName: 'TestNewUser2'
    }]

    userModel.addContact('2fbcf4a7-05dc-483d-a83d-a9558eacc56c', 'TestNewUser2', '7ce568aa-ff76-4d58-8bea-1f4ad2379d27');
    expect(users[0].emergencyContact).toStrictEqual(user);
    expect(users[0].pendingEmergencyContact).toStrictEqual([]);
});

test('It should not be able to find the user and add new emergency contact', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var pendingEmergencyContact = userlist[i].pendingEmergencyContact;
                var username = userName['$push'].emergencyContact.userName;
                var userid = userName['$push'].emergencyContact.userId;
                users[i].emergencyContact.push({userId: userid, userName: username})
                for (var j in pendingEmergencyContact){
                    if(pendingEmergencyContact[j] === username){
                        users[i].pendingEmergencyContact.splice(j, 1)
                        return chainMock;
                    }
                }
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return null;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: ['TestNewUser2']
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2'
    }];

    userModel.addContact('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', 'TestNewUser2', '7ce568aa-ff76-4d58-8bea-1f4ad2379d27');
    expect(users[0].emergencyContact).toStrictEqual([]);
    expect(users[0].pendingEmergencyContact).toStrictEqual(['TestNewUser2']);
});

test('It should be able to add request to the user', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, request)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                users[i].emergencyRequest.push(request['$push'].emergencyRequest)
                return chainMock;
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return users;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        emergencyRequest:[]
    }];

    let request = [{
        senderId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        senderName: 'TestNewUser',
        receiverId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        receiverName: 'TestNewUser2'
    }]

    userModel.addReceiverRequest('7ce568aa-ff76-4d58-8bea-1f4ad2379d27', request[0]);
    expect(users[1].emergencyRequest).toStrictEqual(request);
});

test('It should not be able to find the user and add request', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, request)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                users[i].emergencyRequest.push(request['$push'].emergencyRequest)
                return chainMock;
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return null;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        emergencyRequest:[]
    }];
    let request = [{
        senderId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        senderName: 'TestNewUser',
        receiverId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        receiverName: 'TestNewUser2'
    }]

    userModel.addReceiverRequest('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', request[0]);
    expect(users[1].emergencyRequest).toStrictEqual([]);
});

test('It should be able to add pending emergency contact to the user', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var username = userName['$push'].pendingEmergencyContact;
                users[i].pendingEmergencyContact.push(username)
                return chainMock;
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return users;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: [],
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        emergencyContact:[],
        pendingEmergencyContact: [],
        emergencyRequest:[]
    }];

    userModel.addPendingEC('2fbcf4a7-05dc-483d-a83d-a9558eacc56c', 'TestNewUser2');
    expect(users[0].pendingEmergencyContact).toStrictEqual(['TestNewUser2']);
});

test('It should not be able to find the user and add pending emergency contact', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var username = userName['$push'].pendingEmergencyContact;
                users[i].pendingEmergencyContact.push(username)
                return chainMock;
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return null;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: [],
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        emergencyContact:[],
        pendingEmergencyContact: [],
        emergencyRequest:[]
    }];

    userModel.addPendingEC('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', 'TestNewUser2');
    expect(users[0].pendingEmergencyContact).toStrictEqual([]);
});

test('It should be able to remove pending emergency contact from the user', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var pendingEmergencyContact = userlist[i].pendingEmergencyContact
                for (var j in pendingEmergencyContact){
                    if(pendingEmergencyContact[j] === userName['$pull'].pendingEmergencyContact){
                        users[i].pendingEmergencyContact.splice(j)
                        return chainMock;
                    }
                }
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return users;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: ['TestNewUser2'],
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2'
    }];

    userModel.removePendingEC('2fbcf4a7-05dc-483d-a83d-a9558eacc56c', 'TestNewUser2');
    expect(users[0].pendingEmergencyContact).toStrictEqual([]);
});

test('It should not be able to find the user and remove pending emergency contact', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var pendingEmergencyContact = userlist[i].pendingEmergencyContact
                for (var j in pendingEmergencyContact){
                    if(pendingEmergencyContact[j] === userName['$pull'].pendingEmergencyContact){
                        users[i].pendingEmergencyContact.splice(j)
                        return chainMock;
                    }
                }
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return null;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: ['TestNewUser2'],
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2'
    }];

    userModel.removePendingEC('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', 'TestNewUser2');
    expect(users[0].pendingEmergencyContact).toStrictEqual(['TestNewUser2']);
});

test('It should be able to remove pending emergency contact from the user', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var emergencyRequest = userlist[i].emergencyRequest
                for (var j in emergencyRequest){
                    if(emergencyRequest[j].senderId === userName['$pull'].emergencyRequest.senderId){
                        users[i].emergencyRequest.splice(j, 1)
                        return chainMock;
                    }
                }
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return users;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: ['TestNewUser2'],
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        emergencyRequest:[{
            senderId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            senderName: 'TestNewUser',
            receiverId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
            receiverName: 'TestNewUser2'
        }]
    }];

    userModel.responseContact('2fbcf4a7-05dc-483d-a83d-a9558eacc56c', '7ce568aa-ff76-4d58-8bea-1f4ad2379d27');
    expect(users[1].emergencyRequest).toStrictEqual([]);
});

test('It should not be able to find the user and remove pending emergency contact', ()=>{
    jest.spyOn(User, 'updateOne').mockImplementation((userId, userName)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                var emergencyRequest = userlist[i].emergencyRequest
                for (var j in emergencyRequest){
                    if(emergencyRequest[j].senderId === userName['$pull'].emergencyRequest.senderId){
                        users[i].emergencyRequest.splice(j, 1)
                        return chainMock;
                    }
                }
            }
        }
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return null;
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        emergencyContact:[],
        pendingEmergencyContact: ['TestNewUser2'],
        emergencyRequest:[]
    }, {
        userId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        username: 'TestNewUser2',
        emergencyRequest:[{
            senderId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            senderName: 'TestNewUser',
            receiverId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
            receiverName: 'TestNewUser2'
        }]
    }];

    userModel.responseContact('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', '7ce568aa-ff76-4d58-8bea-1f4ad2379d27');
    expect(users[1].emergencyRequest).toStrictEqual([{
        senderId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        senderName: 'TestNewUser',
        receiverId: '7ce568aa-ff76-4d58-8bea-1f4ad2379d27',
        receiverName: 'TestNewUser2'
    }]);
});

// chatroom
test('It should be able to find chatroom by roomId', ()=>{
    jest.spyOn(Chatroom, 'findOne').mockImplementation((id)=>{
        chatRooms = chatRooms.filter( u => id.id === u.id)
        return chainMock;
    });

    chainMock = {
        exec: jest.fn(() => {
            return chatRooms;
        }),
    };

    chatRooms = [{
        id: 'mockChatRoomId',
        userIds: ['userId1', 'userId2'],
        creater: 'mockCreater'
    },{
        id: 'mockChatRoomId2',
        userIds: ['userId3', 'userId4'],
        creater: 'mockCreater1'
    }];
    let chatRoom = [{
        id: 'mockChatRoomId',
        userIds: ['userId1', 'userId2'],
        creater: 'mockCreater'
    }];

    chatroomModel.findChatroomByRoomId('mockChatRoomId');
    expect(chatRooms).toStrictEqual(chatRoom);
});