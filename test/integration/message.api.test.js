let agent = require('superagent');
const db = require('./in-memory-database.js');
const MessageModel = require("../../models/message.model.js");
const mongoose = require('mongoose');
const MessageSchema = require('../../schema/message.schema.js').MessageSchema;
const Message = mongoose.model('message', MessageSchema);
let messageModel = MessageModel.getInstance(Message);
const database = require('../../models/database.js');

let PORT = 8000;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app');
let server;
let token;
let userId;

let dummy = { username: 'TestUser1', password: 'xyz123'};

beforeAll(async () => {
    server = await app.listen(PORT);
    await db.connect();
});

beforeEach(async () => {
    let loginRes = await agent.post(HOST + '/sessions/registration').send(dummy);
    let text = JSON.parse(loginRes.res.text);
    token = text.token;
    userId = text.userId;
    jest.spyOn(messageModel, 'setStrategy').mockImplementation(() => {
        return; //do nothing
    });
    jest.spyOn(database, 'getBindingConnection').mockImplementation(() => {
        return mongoose.connection;
    });
});

afterEach(async () => {
    await db.clearDatabase()
});

afterAll(async () => {
    await server.close();
    await db.closeDatabase();
});

test('User can send a message by a room',  (done) => {
    let mockRequest = {
        chatRoomId: 'chatRoomId',
        senderId: '1',
        receiver: 'receiver',
        receiverId: '2',
        readOrNot: false,
        content: 'mockMessage',
        status: 'OK'
    }
    agent.post(HOST + '/messages/chatRoomId')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            expect(res.text).toEqual('user ' + mockRequest.name + ' post a new message in room: ' + mockRequest.chatRoomId);
            done();
        });
});

test('User can send a message to a public room',  (done) => {
    let mockRequest = {
        chatRoomId: 'chatRoomId',
        senderId: '1',
        receiver: 'ALL',
        receiverId: '2',
        readOrNot: false,
        content: 'mockMessage',
        status: 'OK'
    }
    agent.post(HOST + '/messages/chatRoomId')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            expect(res.text).toEqual('user ' + mockRequest.name + ' post a new message in room: ' + mockRequest.chatRoomId);
            done();
        });
});

test('User can find all messages in a room', (done) => {
    let mockRequest = {
        chatRoomId: 'chatRoomId',
        content: 'mockMessage',
        status: 'OK'
    }
    agent.post(HOST + '/messages/chatRoomId')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end(() => {
            agent.get(HOST + '/messages/chatRoomId')
                .set('authorization', "Bearer " + token)
                .send()
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    let jsonObj = JSON.parse(res.text);
                    expect(jsonObj).toHaveLength(1);
                    expect(jsonObj[0].chatRoomId).toEqual(mockRequest.chatRoomId);
                    expect(jsonObj[0].content).toEqual(mockRequest.content);
                    expect(jsonObj[0].senderStatus).toEqual(mockRequest.status);
                    done();
                });
        });
});

test('User can find all unread messages2', async () => {
    let mockRequest1 = {
        chatRoomId: 'chatRoomId',
        receiverId: '1',
        content: 'mockMessage1',
        readOrNot: false,
    }
    let mockRequest2 = {
        chatRoomId: 'chatRoomId',
        receiverId: '1',
        content: 'mockMessage2',
        readOrNot: true,
    }
    await agent.post(HOST + '/messages/chatRoomId')
        .set('authorization', "Bearer " + token)
        .send(mockRequest1);
    await agent.post(HOST + '/messages/chatRoomId')
        .set('authorization', "Bearer " + token)
        .send(mockRequest2)
    let res =  await agent.get(HOST + '/messages/private/unread/1')
        .set('authorization', "Bearer " + token)
        .send();

    expect(res.status).toBe(200);

    let jsonObj = JSON.parse(res.text);
    expect(jsonObj).toHaveLength(1);
    expect(jsonObj[0].chatRoomId).toEqual(mockRequest1.chatRoomId);
    expect(jsonObj[0].receiverId).toEqual(mockRequest1.receiverId);
    expect(jsonObj[0].content).toEqual(mockRequest1.content);
    expect(jsonObj[0].readOrNot).toEqual(false);
});

test('User can update unread message to read', async () => {
    let mockPostRequest = {
        chatRoomId: 'chatRoomId',
        receiverId: '1',
        content: 'mockMessage',
        readOrNot: true,
    }
    let mockPutRequest = {
        chatRoomId: 'chatRoomId',
        receiverId: '1',
    }

    await agent.post(HOST + '/messages/chatRoomId')
        .set('authorization', "Bearer " + token)
        .send(mockPostRequest);

    let putRes = await agent.put(HOST + '/messages/unread/update')
        .set('authorization', "Bearer " + token)
        .send(mockPutRequest);

    expect(putRes.status).toBe(200);

    let res = await agent.get(HOST + '/messages/private/unread/1')
        .set('authorization', "Bearer " + token)
        .send();

    let jsonObj = JSON.parse(res.text);
    expect(jsonObj).toHaveLength(0);
});

test('User can update a request response of a message', async () => {
    let mockPostRequest = {
        chatRoomId: 'chatRoomId',
        receiverId: '1',
        requestId: '12345678',
        content: 'mockMessage',
        readOrNot: true,
    }
    let mockPutRequest = {
        response: "Approve"
    }

    await agent.post(HOST + '/messages/chatRoomId')
        .set('authorization', "Bearer " + token)
        .send(mockPostRequest);

    let putRes = await agent.put(HOST + '/messages/response/'+'12345678')
        .set('authorization', "Bearer " + token)
        .send(mockPutRequest);

    expect(putRes.status).toBe(200);
});

test('User can get all latest messages', (done) => {
    agent.get(HOST + '/messages/public/latest')
        .set('authorization', "Bearer " + token)
        .send()
        .end((err, res) => {
            expect(res.status).toBe(200);
            //TODO: complete actual response check
            done();
        })
});
