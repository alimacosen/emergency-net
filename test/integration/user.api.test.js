let agent = require('superagent');
const db = require('./in-memory-database.js');

let PORT = 8000;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app');
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

test('User can get user information', async () => {
    let res = await agent
    .get(HOST + '/users/' + userId)
    .set('authorization', "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.res.text).toContain('username');
    expect(res.res.text).toContain('userId');
    expect(res.res.text).toContain('createDate');
});

test('User can get all users', async () => {
    await agent.post(HOST + '/sessions/registration').send(goofy);
    await agent.post(HOST + '/sessions/registration').send(silly);
    await agent.post(HOST + '/sessions/registration').send(folly);
    let res = await agent
    .get(HOST + '/users/')
    .set('authorization', "Bearer " + token);
    expect(res.status).toBe(200);
    expect(res.res.text).toContain('TestUser1');
    expect(res.res.text).toContain('TestUser2');
    expect(res.res.text).toContain('TestUser3');
    expect(res.res.text).toContain('TestUser4');
});

test('User can get all users', async () => {
  await agent.post(HOST + '/sessions/registration').send(goofy);
  await agent.post(HOST + '/sessions/registration').send(silly);
  await agent.post(HOST + '/sessions/registration').send(folly);
  let res = await agent
  .get(HOST + '/users/alluser')
  .set('authorization', "Bearer " + token);
  expect(res.status).toBe(200);
  expect(res.res.text).toContain('TestUser1');
  expect(res.res.text).toContain('TestUser2');
  expect(res.res.text).toContain('TestUser3');
  expect(res.res.text).toContain('TestUser4');
});

test('User can get all banned users', async () => {
  await agent.post(HOST + '/sessions/registration').send(goofy);
  await agent.post(HOST + '/sessions/registration').send(silly);
  await agent.post(HOST + '/sessions/registration').send(folly);
  let res = await agent
  .get(HOST + '/users/bannedusers')
  .set('authorization', "Bearer " + token);
  expect(res.status).toBe(200);
});

test('User can acknowledge the agreement', async () => {
    let res = await agent
    .post(HOST + '/users/ack')
    .set('authorization', "Bearer " + token)
    .send({ackStatement:"1"});
    expect(res.status).toBe(200);
});

test('User can update active status', async () => {
    let res = await agent
    .post(HOST + '/users/actstatus')
    .set('authorization', "Bearer " + token)
    .send({activeStatus:"1"});
    expect(res.status).toBe(200);
});

test('User can update current status', async () => {
    let res = await agent
    .post(HOST + '/users/userstatus')
    .set('authorization', "Bearer " + token)
    .send({username: "TestUser1", userStatus:"1"});
    expect(res.status).toBe(200);
});

test('respondContact-if', async () => {
    let jsonObj = {
        senderId: userId,
        receiverName: silly.username,
        response: "true"
    }

    let res = await agent
        .post(HOST + '/users/ECrespond')
        .set('authorization', "Bearer " + token)
        .send(jsonObj);

    expect(res.status).toBe(200);
});

test('respondContact-else', async () => {
    let jsonObj = {
        senderId: userId,
        receiverName: silly.username,
        response: "false"
    }

    let res = await agent
        .post(HOST + '/users/ECrespond')
        .set('authorization', "Bearer " + token)
        .send(jsonObj);

    expect(res.status).toBe(200);
});