
let agent = require('superagent');
const db = require('./in-memory-database.js');

let PORT = 8000;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app');
const { json } = require('express/lib/response');

let server;
let token;
let userId;
let dummy = { username: 'TestUser1', password: 'xyz123'};
let goofy = { username: 'TestUser2', password: 'vwy207'};

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

test('User can get server current status', async () => {
    let res = await agent
        .get(HOST + '/performance/status')
        .set('authorization', "Bearer " + token);
    expect(res.status).toBe(200);
});

test('User can change server current status', async () => {
    let res = await agent
        .post(HOST + '/performance/status')
        .set('authorization', "Bearer " + token);
    expect(res.status).toBe(200);
});

test('User cannot delete server current status if they are not a administrator', async () => {
    try {
        let res = await agent
            .delete(HOST + '/performance/status')
            .set('authorization', "Bearer " + token);
        fail('it should not reach here');
    } catch (error) {
        expect(error.status).toBe(401);
    }
});
