let agent = require('superagent');
const db = require('./in-memory-database.js');
const EmergencySupplyModel = require("../../models/emergencySupply.model.js");
const mongoose = require('mongoose');
const EmergencySupplySchema = require('../../schema/emergencySupply.schema.js').EmergencySupplySchema;
const EmergencySupply = mongoose.model('emergencySupply', EmergencySupplySchema);
let emergencySupplyModel = EmergencySupplyModel.getInstance(EmergencySupply);
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
    jest.spyOn(emergencySupplyModel, 'setStrategy').mockImplementation(() => {
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

test('User can create an emergencySupply by given type and quantity',  (done) => {
    let mockRequest = {
        provider : "test123456",
        providerId : "testid123456",
        type : "food",
        quantity : "6",
    }
    agent.post(HOST + '/emergencySupplies/')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            expect(res.text).toEqual('user ' + mockRequest.provider + ' share a supply!');
            done();
        });
});

test('User can find all supplies',  (done) => {
    agent.get(HOST + '/emergencySupplies/')
        .set('authorization', "Bearer " + token)
        .send()
        .end((err, res) => {
            expect(res.status).toBe(200);
            done();
        });
});


test('User can update the quantity of emergencySupply', async () => {
    let mockPostRequest = {
        provider : "test123456",
        providerId : "testid123456",
        type : "food",
        quantity : "6",
    }
    let mockPutRequest = {
        provider : "test123456",
        type : "food",
        quantity : "8",
    }

    await agent.post(HOST + '/emergencySupplies')
        .set('authorization', "Bearer " + token)
        .send(mockPostRequest);

    let putRes = await agent.put(HOST + '/emergencySupplies')
        .set('authorization', "Bearer " + token)
        .send(mockPutRequest);

    expect(putRes.status).toBe(200);
});


test('User can update the quantity of emergencySupply after approval', async () => {
    let mockPostRequest = {
        provider : "test123456",
        providerId : "testid123456",
        type : "food",
        quantity : "6",
    }
    let mockPutRequest = {
        provider : "test123456",
        providerId : "testid123456",
        type : "food",
        quantity : "2",
    }

    await agent.post(HOST + '/emergencySupplies')
        .set('authorization', "Bearer " + token)
        .send(mockPostRequest);

    let putRes = await agent.put(HOST + '/emergencySupplies/food/testid123456')
        .set('authorization', "Bearer " + token)
        .send(mockPutRequest);

    expect(putRes.status).toBe(200);
});

test('User can update the quantity of emergencySupply after approval and delete supply if quantity becomes 0.', async () => {
    let mockPostRequest = {
        provider : "test123456",
        providerId : "testid123456",
        type : "food",
        quantity : "6",
    }
    let mockPutRequest = {
        provider : "test123456",
        providerId : "testid123456",
        type : "food",
        quantity : "6",
    }

    await agent.post(HOST + '/emergencySupplies')
        .set('authorization', "Bearer " + token)
        .send(mockPostRequest);

    let putRes = await agent.put(HOST + '/emergencySupplies/food/testid123456')
        .set('authorization', "Bearer " + token)
        .send(mockPutRequest);

    expect(putRes.status).toBe(200);
});

test('User can delete the emergencySupply', async () => {
    let mockPostRequest = {
        provider : "test123456",
        providerId : "testid123456",
        type : "food",
        quantity : "6",
    }
    let mockDeleteRequest = {
        provider : "test123456",
        type : "food",
    }

    await agent.post(HOST + '/emergencySupplies')
        .set('authorization', "Bearer " + token)
        .send(mockPostRequest);

    let deleteRes = await agent.delete(HOST + '/emergencySupplies')
        .set('authorization', "Bearer " + token)
        .send(mockDeleteRequest);

    expect(deleteRes.status).toBe(200);
});