
let agent = require('superagent');
const db = require('./in-memory-database.js');

let PORT = 8000;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app');
const { mock } = require('./nodemailer.js');
const { json } = require('express/lib/response');

var server;
let token;
let userId;

// Dummy Users
let dummy = { username: 'TestUser1', password: 'xyz123'};
let goofy = { username: 'TestUser2', password: 'vwy207'};
let silly = { username: 'TestUser3', password: 'xyz124'};
let folly = { username: 'TestUser4', password: 'aaasdf'};

beforeAll(async () => {
  server = await app.listen(PORT);
  await db.connect();
});

beforeEach(async () => {
    let loginRes = await agent.post(HOST + '/sessions/registration').send(dummy);
    let text = JSON.parse(loginRes.res.text);
    token = text.token;
    userId = text.userId;
});

afterEach(async () => {
  await db.clearDatabase()
});

afterAll(async () => {
  await server.close();
  await db.closeDatabase();
});

test('User can update his/her email', async () => {
    let res = await agent
    .post(HOST + '/users/useremail')
    .set('authorization', "Bearer " + token)
    .send("{email:'name@example.com'}");
    expect(res.status).toBe(200);
});

test('User can remove his/her contact', async () => {
    let res = await agent
    .post(HOST + '/users/removeContact')
    .set('authorization', "Bearer " + token)
    .send("{username:'TestUser1'}");
    expect(res.status).toBe(200);
});

test('User can send emergency contact request', async () => {
    let res = await agent
    .post(HOST + '/users/ECrequest')
    .set('authorization', "Bearer " + token)
    .send("{receiverId:'vwy207', receiverName:'TestUser2', senderName:'TestUser1'}");
    expect(res.status).toBe(200);
});

test('User can update emergency request response', async () => {
    let res = await agent
    .post(HOST + '/users/ECrespond')
    .set('authorization', "Bearer " + token)
    .send('{senderId:"vwy207", response:"true", receiverName:"TestUser1"}');

    expect(res.status).toBe(200);
});

test('User can update emergency request response', async () => {
  let res2 = await agent
  .post(HOST + '/users/ECrespond')
  .set('authorization', "Bearer " + token)
  .send('{senderId:"vwy207", response:"false", receiverName:"TestUser1"}');

  expect(res2.status).toBe(200);
});

test('Email will be sent', async () => {
  let res2 = await agent
  .post(HOST + '/users//email')
  .set('authorization', "Bearer " + token)
  .send('{privateRoomId:"f621493a-87ce-4061-8e08-1f5bc54ef357", content:"emergency, userEmail: "name@example.com"}');

  expect(res2.status).toBe(200);
});

test('Email will not be sent', async () => {
  let res2 = await agent
  .post(HOST + '/users//email')
  .set('authorization', "Bearer " + token)
  .send('{privateRoomId:"f621493a-87ce-4061-8e08-1f5bc54ef357", content:"emergency, userEmail: ""}');

  let sentEmails = mock.getSentMail()
  expect(sentEmails.length).toBe(0);
  //TODO: expect(res2.status).toBe(200);
});

// chatroom
test('System can find a private chat room', (done) => {
  let jsonObject = {
    chatroomId: ['1']
  }
  agent.get(HOST + '/chatroom/private/1')
      .set('authorization', "Bearer " + token)
      .send()
      .end((err, res) => {
          expect(res.status).toBe(200);
          done();
      })
});

