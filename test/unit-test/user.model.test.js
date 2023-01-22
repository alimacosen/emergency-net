const { v4: uuid } = require('uuid');
const UserModel = require("../../models/user.model.js");
const mongoose = require('mongoose');
const UserStatusModelTest = require("../../models/userStatus.model");
const UserSchema = require('../../schema/user.schema.js').UserSchema;
const User = mongoose.model('user', UserSchema);
let userModel = UserModel.getInstance(User);

let users;

beforeAll(async () => {
    users = [];
});

beforeEach(() => {
    jest.spyOn(User, 'find').mockImplementation(()=>{
        return chainMock;
    });

    const chainMock = {
        sort: jest.fn(() => {
            users.sort(function(a, b) {
                return a.username-b.username;
            });
            return chainMock;
        }),
        equals: jest.fn((accountStatus) => {
            users = users.filter(item=>item.accountStatus === accountStatus);
            return chainMock;
        }),
        exec: jest.fn(() => {
            return users;
        })
    };
});

test('It should be able to add new user', ()=>{
    jest.spyOn(User, 'create').mockImplementation((u)=>{
        users.push(u);
    });

    let user = {
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    }
    userModel.addUser(user);
    expect(users[0]).toBe(user);
});

test('It should find all users', ()=>{
    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    }];

    expect(userModel.findAllUsers()).toBe(users);
});

test('It should find all banned users', ()=>{
    jest.spyOn(User, 'find').mockImplementation((filter)=>{
        users = users.filter(item =>
            filter.accountStatus === item.accountStatus);
        return chainMock;
    });
    const chainMock = {
        exec: jest.fn(() => {
            return users
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined',
        accountStatus: false
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined',
        accountStatus: false
    },{
        userId: '42862410-8071-4490-asdsad-d5a71af50302',
        username: 'TestNewUser3',
        password: '$2a$sadasdbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined',
        accountStatus: true
    }];

    let mockFilter = {
        accountStatus: false,
    }

    let expectResult = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined',
        accountStatus: false
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined',
        accountStatus: false
    }]
    let result = userModel.findBannedUsers(mockFilter)
    expect(result).toStrictEqual(expectResult);
});

test('It should create one and only one instance', () => {
    let newUserModel = UserModel.getInstance(User);
    expect(userModel).toBe(newUserModel);
});

test('It should find user by ID', ()=>{
    jest.spyOn(User, 'findOne').mockImplementation((userId)=>{
        users = users.filter( u => userId.userId === u.userId)
        return chainMock;
    });

    const chainMock = {
        exec: jest.fn(() => {
            return users
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }];
    let user = [{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }]
    expect(userModel.findUserById('42862410-8071-4490-89da-d5a71af50302')).toStrictEqual(user);
});

test('It should find user by ID', ()=>{
    jest.spyOn(User, 'findOne').mockImplementation((userId)=>{
        users = users.filter( u => userId.userId === u.userId)
        return chainMock;
    });

    const chainMock = {
        exec: jest.fn(() => {
            return users
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }];
    let user = [{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }]
    userModel.asyncFindUserById('42862410-8071-4490-89da-d5a71af50302')
    expect(users).toStrictEqual(user);
});

test('It should find user by username', ()=>{
    jest.spyOn(User, 'findOne').mockImplementation((username)=>{
        users = users.filter( u => username.username === u.username)
        return chainMock;
    });

    const chainMock = {
        exec: jest.fn(() => {
            return users
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }];
    let user = [{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }]
    expect(userModel.findUser('TestNewUser2')).toStrictEqual(user)
});

//TODO: finish test('It should find all online users')

//TODO: finish test('It should find all offline users')

test('It should change user acknowledge status', ()=>{
    jest.spyOn(User, 'findOneAndUpdate').mockImplementation((userId, ackStatement)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                userlist[i].ackStatement = ackStatement.ackStatement;
                return chainMock;
            }
        }
        return chainMock;
    });

    const chainMock = {
        exec: jest.fn(() => {
            return users
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }];
    let user = {
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: true,
        activeStatus: false,
        userStatus: 'Ok'
    }
    userModel.setUserAck('42862410-8071-4490-89da-d5a71af50302', true)
    expect(users[1]).toStrictEqual(user)
});

test('It should change none of the user status', ()=>{
    jest.spyOn(User, 'findOneAndUpdate').mockImplementation((userId, activeStatus)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                userlist[i].activeStatus = activeStatus.activeStatus;
                return chainMock;
            }
        }
        return chainMock;
    });

    const chainMock = {
        exec: jest.fn((n) => {
            return null
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }];
    
    userModel.setUserActStatus('8e68c96b-e29d-49e5-a5e0-ee0759af8f60', true)
    expect(users[0].activeStatus).toBe(false)
    expect(users[1].activeStatus).toBe(false)
});

test('It should change user online status', ()=>{
    jest.spyOn(User, 'findOneAndUpdate').mockImplementation((userId, activeStatus)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                userlist[i].activeStatus = activeStatus.activeStatus;
                return chainMock;
            }
        }
        return chainMock;
    });

    const chainMock = {
        exec: jest.fn(() => {
            return users
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }];
    let user = {
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: true,
        userStatus: 'Ok'
    }
    userModel.setUserActStatus('42862410-8071-4490-89da-d5a71af50302', true)
    expect(users[1]).toStrictEqual(user)
});

test('It should change user status', ()=>{
    jest.spyOn(User, 'findOneAndUpdate').mockImplementation((userId, userStatus)=>{
        var userlist = users;
        for (var i in userlist){
            if (userlist[i].userId === userId.userId){
                userlist[i].userStatus = userStatus.userStatus;
                return chainMock;
            }
        }
    });

    const chainMock = {
        exec: jest.fn(() => {
            return users
        })
    };

    users = [{
        userId: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        username: 'TestNewUser',
        password: "$2a$10$ly1tVhGbjnHTr18tR3Januw1h501IEJD46zGz32tuI19ZluCRLNem",
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Undefined'
    },{
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Ok'
    }];
    let user = {
        userId: '42862410-8071-4490-89da-d5a71af50302',
        username: 'TestNewUser2',
        password: '$2a$10$YsugtbPvjsV7mdElcP5o/ucUgsAmL8iQEaV5j9TLKKyS54nT.YNqS',
        createDate: '12345678',
        ackStatement: false,
        activeStatus: false,
        userStatus: 'Help'
    }
    userModel.setUserCurrentStatus('42862410-8071-4490-89da-d5a71af50302', 'Help')
    expect(users[1]).toStrictEqual(user)
});