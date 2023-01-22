let agent = require('superagent');
const db = require('./in-memory-database.js');
const EmergencySupplyRequestModel = require("../../models/emergencySupplyRequest.model.js");
const mongoose = require('mongoose');
const EmergencySupplyRequestSchema = require('../../schema/emergencySupplyRequest.schema.js').EmergencySupplyRequestSchema;
const EmergencySupplyRequest = mongoose.model('emergencySupplyRequest', EmergencySupplyRequestSchema);
let emergencySupplyRequestModel = EmergencySupplyRequestModel.getInstance(EmergencySupplyRequest);
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
    jest.spyOn(emergencySupplyRequestModel, 'setStrategy').mockImplementation(() => {
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

test('User can create an emergencySupplyRequest by given emergencySupplyRequest Information',  (done) => {
    let mockRequest = {
        requester: "test98765",
        requesterId: "testid98765",
        provider: "test123456",
        providerId: "testid123456",
        type: "food",
        quantity:  "6",
        response: "None",
    }
    agent.post(HOST + '/emergencySupplyRequest/')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            done();
        });
});

test('User can find an emergencySupplyRequest by giving a requestId',  (done) => {
    let mockRequest = {
        requester: "test98765",
        requesterId: "testid98765",
        provider: "test123456",
        providerId: "testid123456",
        type: "food",
        quantity:  "6",
        response: "None",
    }
    let requestId = "";
    agent.post(HOST + '/emergencySupplyRequest/')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            let jsonObj = JSON.parse(res.text);
            expect(jsonObj.requester).toEqual(mockRequest.requester);
            expect(jsonObj.requesterId).toEqual(mockRequest.requesterId);
            expect(jsonObj.provider).toEqual(mockRequest.provider);
            expect(jsonObj.providerId).toEqual(mockRequest.providerId);
            expect(jsonObj.quantity).toEqual(mockRequest.quantity);
            expect(jsonObj.type).toEqual(mockRequest.type);
            expect(jsonObj.response).toEqual(mockRequest.response);
            requestId = jsonObj.id;
            agent.get(HOST + '/emergencySupplyRequest/'+requestId)
                .set('authorization', "Bearer " + token)
                .send()
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    let jsonObj = JSON.parse(res.text);
                    expect(jsonObj.id).toEqual(requestId);
                    done();
            });
    });
});


test('User can update the response of emergencySupplyRequest by given requestId', (done) => {
    let mockRequest = {
        requester: "test98765",
        requesterId: "testid98765",
        provider: "test123456",
        providerId: "testid123456",
        type: "food",
        quantity:  "6",
        response: "None",
    }

    agent.post(HOST + '/emergencySupplyRequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            let jsonObj = JSON.parse(res.text);
            expect(jsonObj.requester).toEqual(mockRequest.requester);
            expect(jsonObj.requesterId).toEqual(mockRequest.requesterId);
            expect(jsonObj.provider).toEqual(mockRequest.provider);
            expect(jsonObj.providerId).toEqual(mockRequest.providerId);
            expect(jsonObj.quantity).toEqual(mockRequest.quantity);
            expect(jsonObj.type).toEqual(mockRequest.type);
            expect(jsonObj.response).toEqual(mockRequest.response);
            let requestId = jsonObj.id;
            let mockPutRequest = {
                id: requestId,
                response: "Approve",
            }
            agent.put(HOST + '/emergencySupplyRequest/'+requestId)
                .set('authorization', "Bearer " + token)
                .send(mockPutRequest)
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    done();
            });
    });
});