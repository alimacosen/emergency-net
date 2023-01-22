let agent = require('superagent');
const db = require('./in-memory-database.js');

let PORT = 8000;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app');
const { json } = require('express/lib/response');

var server;
let token;
let userId1;
let userId2;

// Dummy Users
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
    userId1 = text.userId;
    await agent.post(HOST + '/sessions/registration').send(goofy);
    loginRes = await agent.post(HOST + '/sessions/login').send(goofy);
    text = JSON.parse(loginRes.res.text);
    userId2 = text.userId;
});

afterEach(async () => {
  await db.clearDatabase()
});

afterAll(async () => {
  await server.close();
  await db.closeDatabase();
});

test('System can create a public chat room', async () => {
    let jsonObject = {
        creater: "# Public Group Chat"
    };
    let res = await agent
    .post(HOST + '/chatroom/public')
    .set('authorization', "Bearer " + token)
    .send(jsonObject);
    expect(res.status).toBe(201);
    expect(res.res.text).toContain('# Public Group Chat');
});

// TODO this is one is chatroom bug
// test('User can get public chat room', async () => {
//     let jsonObject = {
//         creater: "# Public Group Chat"
//     };
//     await agent
//     .post(HOST + '/chatroom/public')
//     .set('authorization', "Bearer " + token)
//     .send(jsonObject);
//     res = await agent
//     .get(HOST + '/chatroom/public/existence')
//     .set('authorization', "Bearer " + token)
//     .send(jsonObject);
//     expect(res.status).toBe(200);
//     expect(res.res.text).toContain('# Public Group Chat');
// });

test('System can find a private chat room', (done) => {
    let jsonObject = {
        userIds: ['1', '2']
    }
    agent.post(HOST + '/chatroom/private/1/2')
        .set('authorization', "Bearer " + token)
        .send(jsonObject)
        .end(() => {
            agent.get(HOST + '/chatroom/private/1/2')
                .set('authorization', "Bearer " + token)
                .send()
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    let jsonObj = JSON.parse(res.text);
                    expect(jsonObj.userIds).toEqual(jsonObject.userIds);
                    done();
                });
        });
});

test('System can create a private chat room', (done) => {
    let jsonObject = {
        userIds: ['1', '2']
    }
    agent.post(HOST + '/chatroom/private/1/2')
        .set('authorization', "Bearer " + token)
        .send(jsonObject)
        .end((err, res) => {
            expect(res.status).toBe(201);
            let jsonObj = JSON.parse(res.text);
            expect(jsonObj.userIds).toEqual(jsonObject.userIds);
            done();
        });
});

