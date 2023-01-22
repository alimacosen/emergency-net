
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

test('User can create one rescue record and get all rescords', async () => {
    let mockObj = {
        place: "Mountain View",
        citizenLongitude: -122,
        citizenLatitude: 40
    }
    let res = await agent
        .post(HOST + '/rescues/')
        .set('authorization', "Bearer " + token)
        .send(mockObj);
    expect(res.status).toBe(200);
    let records = await agent
        .get(HOST + '/rescues/')
        .set('authorization', "Bearer " + token);
    let obj = JSON.parse(records.res.text);
    expect(obj.data.length).toBe(1);
});

test('Validator error without using right parameters', async () => {
    let mockObj = {
        place: "Mountain View",
        citizenLongitude: -122
    }
    try {
        let res = await agent
            .post(HOST + '/rescues/')
            .set('authorization', "Bearer " + token)
            .send(mockObj);
        fail('it should not reach here');
    } catch (error) {
        expect(error.status).toBe(422);
    }
});

test('User can not create rescue requests if one has existed', async () => {
    let mockObj = {
        place: "Mountain View",
        citizenLongitude: -122,
        citizenLatitude: 40
    }
    let res = await agent
        .post(HOST + '/rescues/')
        .set('authorization', "Bearer " + token)
        .send(mockObj);
    expect(res.status).toBe(200);
    try { 
        res = await agent
            .post(HOST + '/rescues/')
            .set('authorization', "Bearer " + token)
            .send(mockObj);
            fail('it should not reach here');
      } catch (error) {
        expect(error.status).toBe(409);
      }
});

test('User can create one rescue record and get one specific record', async () => {
    let mockObj = {
        place: "Mountain View",
        citizenLongitude: -122,
        citizenLatitude: 40
    }
    let res = await agent
        .post(HOST + '/rescues/')
        .set('authorization', "Bearer " + token)
        .send(mockObj);

    let records = await agent
        .get(HOST + '/rescues/')
        .set('authorization', "Bearer " + token);
    let obj = JSON.parse(records.res.text);

    let searchId = obj.data[0].id
    let record = await agent
        .get(HOST + '/rescues/' + searchId)
        .set('authorization', "Bearer " + token);

    obj = JSON.parse(record.res.text);
    expect(obj.data.rescue.id).toBe(searchId);
});


test('User can update rescue status to cancel or accomplish', async () => {
    let mockObj = {
        place: "Mountain View",
        citizenLongitude: -122,
        citizenLatitude: 40
    }
    await agent
        .post(HOST + '/rescues/')
        .set('authorization', "Bearer " + token)
        .send(mockObj);

    let records = await agent
        .get(HOST + '/rescues/')
        .set('authorization', "Bearer " + token);
    let obj = JSON.parse(records.res.text);
    let updateId = obj.data[0].id

    await agent
        .patch(HOST + '/rescues/' + updateId + "/status")
        .set('authorization', "Bearer " + token)
        .send({rescueStatus: 2});

    let record = await agent
        .get(HOST + '/rescues/' + updateId)
        .set('authorization', "Bearer " + token);

    obj = JSON.parse(record.res.text);
    expect(obj.data.rescue.rescueStatus).toBe(2);
});

test('Rescure can update locations', async () => {
    let mockObj = {
        place: "Mountain View",
        citizenLongitude: -122,
        citizenLatitude: 40
    }
    await agent
        .post(HOST + '/rescues/')
        .set('authorization', "Bearer " + token)
        .send(mockObj);

    let records = await agent
        .get(HOST + '/rescues/')
        .set('authorization', "Bearer " + token);
    let obj = JSON.parse(records.res.text);
    let updateId = obj.data[0].id

    await agent
        .patch(HOST + '/rescues/' + updateId + "/location")
        .set('authorization', "Bearer " + token)
        .send({rescuerLongitude: 122, rescuerLatitude: 46});

    let record = await agent
        .get(HOST + '/rescues/' + updateId)
        .set('authorization', "Bearer " + token);

    obj = JSON.parse(record.res.text);
    expect(obj.code).toBe(200);
    expect(obj.data.rescue.rescuerLongitude).toBe(122);
    expect(obj.data.rescue.rescuerLatitude).toBe(46);
});

test('Rescure can confirm rescue', async () => {
    let loginRes = await agent.post(HOST + '/sessions/registration').send(goofy);
    let text = JSON.parse(loginRes.res.text);
    let rescuerToken = text.token;
    let rescuerId = text.userId;

    let mockObj = {
        place: "Mountain View",
        citizenLongitude: "-122",
        citizenLatitude: "40"
    }
    await agent
        .post(HOST + '/rescues/')
        .set('authorization', "Bearer " + token)
        .send(mockObj);

    let records = await agent
        .get(HOST + '/rescues/')
        .set('authorization', "Bearer " + token);
    let obj = JSON.parse(records.res.text);
    let updateId = obj.data[0].id

    await agent
        .patch(HOST + '/rescues/' + updateId + "/match")
        .set('authorization', "Bearer " + rescuerToken)
        .send({rescueStatus: 1});

    let record = await agent
        .get(HOST + '/rescues/' + updateId)
        .set('authorization', "Bearer " + token);

    obj = JSON.parse(record.res.text);
    expect(obj.code).toBe(200);
    expect(obj.data.rescue.rescuerId).toBe(rescuerId);
    expect(obj.data.rescue.rescueStatus).toBe(1);
});

test('Rescure can confirm rescue', async () => {
    let mockObj = {
        place: "Mountain View",
        citizenLongitude: -122,
        citizenLatitude: 40
    }
    await agent
        .post(HOST + '/rescues/')
        .set('authorization', "Bearer " + token)
        .send(mockObj);

    let records = await agent
        .get(HOST + '/rescues/')
        .set('authorization', "Bearer " + token);
    let obj = JSON.parse(records.res.text);
    let updateId = obj.data[0].id

    try {
        await agent
        .patch(HOST + '/rescues/' + updateId + "/match")
        .set('authorization', "Bearer " + token)
        .send({rescueStatus: 1});
        fail('it should not reach here');
    } catch (error) {
        expect(error.status).toBe(406);
    }
});
