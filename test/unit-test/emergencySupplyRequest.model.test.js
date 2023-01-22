const EmergencySupplyRequestModel = require("../../models/emergencySupplyRequest.model.js");
const mongoose = require('mongoose');
const PerformanceModel = require("../../models/performance.model");
const EmergencySupplyRequestSchema = require('../../schema/emergencySupplyRequest.schema.js').EmergencySupplyRequestSchema;
const EmergencySupplyRequest = mongoose.model('emergencySupplyRequest', EmergencySupplyRequestSchema);
let emergencySupplyRequestModel = EmergencySupplyRequestModel.getInstance(EmergencySupplyRequest);

let emergencySupplyRequests;
let chainMock;

beforeAll(async () => {
    emergencySupplyRequests = [];
});

beforeEach(() => {
    jest.spyOn(EmergencySupplyRequest, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        where: jest.fn((attribute) => {
            return chainMock;
        }),
        equals: jest.fn((id) => {
            emergencySupplyRequests = emergencySupplyRequests.filter(item=>item.id === id);
            return chainMock;
        }),
        sort: jest.fn(() => {
            emergencySupplyRequests.sort(function(a, b) {
                return a.createDate-b.createDate;
            });
            return chainMock;
        }),
        limit: jest.fn((num) => {
            emergencySupplyRequests = emergencySupplyRequests.slice(0, num);
            return chainMock;
        }),
        exec: jest.fn(() => {
            return emergencySupplyRequests;
        }),
    };
});

test('It should be able to save a emergencySupply', ()=>{

    let spy = jest.spyOn(EmergencySupplyRequest, 'create').mockImplementation((m)=>{
        emergencySupplyRequests.push(m);
    });

    let emergencySupplyRequest = {
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        requester : "TestUser00",
        requesterId : "TestUser00123456",
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        response: "None",
        createDate: 1647047122477,
    };
    emergencySupplyRequestModel.createEmergencySupplyRequest(emergencySupplyRequest);
    expect(emergencySupplyRequests[0]).toBe(emergencySupplyRequest);

});

test('It should be able to read one emergencySupplyRequest', ()=>{
    jest.spyOn(EmergencySupplyRequest, 'findOne').mockImplementation((filter)=>{
        emergencySupplyRequests = emergencySupplyRequests.filter(item =>
            item.id === filter.id);
        return chainMock;
    });
    emergencySupplyRequests = [{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        requester : "TestUser00",
        requesterId : "TestUser00123456",
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '20',
        response: "None",
        createDate: 1647047122477,
    },{
        id: '2fbcf4a7-05dc-483d-a83d-a9558ea12c56c',
        requester : "TestUser00",
        requesterId : "TestUser00123456",
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'food',
        quantity: '12',
        response: "None",
        createDate: 1647047122472,
    }];
    let filter = {
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
    }
    let oneEmergencySupplyRequest = emergencySupplyRequestModel.retrieveEmergencySupplyRequest(filter);
    expect(oneEmergencySupplyRequest).toHaveLength(1);
    expect(oneEmergencySupplyRequest[0]).toBe(emergencySupplyRequests[0]);
});


test('It should be able to update the response of an emergencySupplyRequest', () => {
    jest.spyOn(EmergencySupplyRequest, 'findOneAndUpdate').mockImplementation((condition)=>{
        emergencySupplyRequests.filter( m =>condition.id === m.id)
        .forEach( m => m.response = "Approve")
        return chainMock;
    });
    emergencySupplyRequests = [{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        requester : "TestUser00",
        requesterId : "TestUser00123456",
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        response: "None",
        createDate: 1647047122477,
    },{
        id: '2fbcf4a7-05dc-483d-a83d-a9558ea12c56c',
        requester : "TestUser00",
        requesterId : "TestUser00123456",
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'food',
        quantity: '12',
        response: "None",
        createDate: 1647047122472,
    }];
    let mockCondition = {
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c'
    }
    let update = {
        response: "Approve"
    }
    emergencySupplyRequestModel.updateEmergencySupplyRequest(mockCondition,update);
    expect(emergencySupplyRequests[0].response).toBe(update.response);
});

test('It should create one and only one instance', () => {
    let newEmergencySupplyRequestModel = EmergencySupplyRequestModel.getInstance(EmergencySupplyRequest);
    expect(emergencySupplyRequestModel).toBe(newEmergencySupplyRequestModel);
});