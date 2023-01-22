let agent = require('superagent');
const db = require('./in-memory-database.js');

let PORT = 8000;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app');
const { json } = require('express/lib/response');

var server;

beforeAll(async () => {
  server = await app.listen(PORT);
  await db.connect();
});

afterEach(async () => {
  await db.clearDatabase()
});

afterAll(async () => {
  await server.close();
  await db.closeDatabase();
});

// Dummy Users
let dummy = { username: 'TestUser', password: 'xyz123'};

test('Non-existing user cannot sign in', async () => {
  try { 
    await agent.post(HOST + '/sessions/login').send(dummy);
  } catch (error) {
    expect(error.status).toBe(500);
    let text = JSON.parse(error.response.res.text);
    expect(text.message).toBe("Username or password not exists.");
  }
});

test('User can register an account', async () => {
  let res = await agent.post(HOST + '/sessions/registration').send(dummy);
  expect(res.status).toBe(200);
});

test('User can register an account and login', async () => {
  await agent.post(HOST + '/sessions/registration').send(dummy);
  let res = await agent.post(HOST + '/sessions/login').send(dummy);
  expect(res.status).toBe(200);
});

test('User can login and logout', async () => {
  await agent.post(HOST + '/sessions/registration').send(dummy);
  let loginRes = await agent.post(HOST + '/sessions/login').send(dummy);
  let text = JSON.parse(loginRes.res.text);
  let token = text.token;
  try {
    let res = await agent
    .delete(HOST + '/sessions/logout')
    .send(dummy)
    .set('authorization', "Bearer " +token);
    expect(res.status).toBe(200);
    expect(res.res.text).toBe('User logged out.');
  } catch (error) {
    console.log(error)
  }
});

test('User can NOT login if password is wrong', async () => {
  await agent.post(HOST + '/sessions/registration').send(dummy);
  try {
    dummy.password = '123456789';
    let loginRes = await agent
        .post(HOST + '/sessions/login')
        .send(dummy)
  } catch (error) {
    console.log(error)
  }
});