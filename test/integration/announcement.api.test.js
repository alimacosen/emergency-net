let agent = require('superagent');
const db = require('./in-memory-database.js');
const AnnouncementModel = require("../../models/announcement.model.js");
const mongoose = require('mongoose');
const AnnouncementSchema = require('../../schema/announcement.schema.js').AnnouncementSchema;
const Announcement = mongoose.model('announcement', AnnouncementSchema);
let announcementModel = AnnouncementModel.getInstance(Announcement);
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
    jest.spyOn(announcementModel, 'setStrategy').mockImplementation(() => {
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

test('User can create an announcement by given information',  (done) => {
    let mockRequest = {
        sender : "test123456",
        senderId : "testid123456",
        content : "I want some food!!!",
        status : "OK",
    }
    agent.post(HOST + '/announcements/')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            expect(res.text).toEqual('user ' + mockRequest.sender + ' post a new announcement in room!');
            done();
        });
});

test('User can find all announcements',  (done) => {
    agent.get(HOST + '/announcements/')
        .set('authorization', "Bearer " + token)
        .send()
        .end((err, res) => {
            expect(res.status).toBe(200);
            done();
        });
});