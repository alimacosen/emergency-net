const EmergencySupplyModel = require("../../models/emergencySupply.model.js");
const mongoose = require('mongoose');
const PerformanceModel = require("../../models/performance.model");
const EmergencySupplySchema = require('../../schema/emergencySupply.schema.js').EmergencySupplySchema;
const EmergencySupply = mongoose.model('emergencySupply', EmergencySupplySchema);
let emergencySupplyModel = EmergencySupplyModel.getInstance(EmergencySupply);

let emergencySupplies;
let chainMock;

beforeAll(async () => {
    emergencySupplies = [];
});

beforeEach(() => {
    jest.spyOn(EmergencySupply, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        where: jest.fn((attribute) => {
            return chainMock;
        }),
        equals: jest.fn((provider) => {
            emergencySupplies = emergencySupplies.filter(item=>item.provider === provider);
            return chainMock;
        }),
        sort: jest.fn(() => {
            emergencySupplies.sort(function(a, b) {
                return a.lastModifiedDate-b.lastModifiedDate;
            });
            return chainMock;
        }),
        limit: jest.fn((num) => {
            emergencySupplies = emergencySupplies.slice(0, num);
            return chainMock;
        }),
        exec: jest.fn(() => {
            return emergencySupplies;
        }),
    };
});

test('It should be able to save a emergencySupply', ()=>{

    let spy = jest.spyOn(EmergencySupply, 'create').mockImplementation((m)=>{
        emergencySupplies.push(m);
    });

    let emergencySupply = {
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        lastModifiedDate: 1647047122477,
    };
    emergencySupplyModel.createEmergencySupply(emergencySupply);
    expect(emergencySupplies[0]).toBe(emergencySupply);

});

test('It should be able to read all emergencySupplies', ()=>{
    emergencySupplies = [{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        lastModifiedDate: 1647047122477,
    }];

    expect(emergencySupplyModel.retrieveEmergencySupplies({})).toBe(emergencySupplies);
});

test('EmergencySupplies should be sorted by lastModifiedDate', ()=>{
    emergencySupplies = [{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        lastModifiedDate: 1647047122477,
    },{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        lastModifiedDate: 1647047122479,
    },{
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        lastModifiedDate: 1647047122478,
    }];

    emergencySupplyModel.retrieveEmergencySupplies({});
    expect(emergencySupplies[0].lastModifiedDate).toBe(1647047122477);
    expect(emergencySupplies[1].lastModifiedDate).toBe(1647047122478);
    expect(emergencySupplies[2].lastModifiedDate).toBe(1647047122479);
});

test('It should read maximum 100 emergencySupplies for client', ()=>{
    let temp = {
        id: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        provider: 'TestUser',
        providerId: 'TestUser123456',
        type: 'water',
        quantity: '16',
        lastModifiedDate: 1647047122477,
    };

    for (let i = 0; i < 150; i ++){
        emergencySupplies.push(temp);
    }

    emergencySupplyModel.retrieveEmergencySupplies({});
    expect(emergencySupplies.length).toBe(100);
});

test('It should be able to get one emergencySupply', () => {
    jest.spyOn(EmergencySupply, 'findOne').mockImplementation((filter)=>{
        emergencySupplies = emergencySupplies.filter(item =>
            item.provider === filter.provider && item.providerId === filter.providerId && item.type === filter.type );
        return chainMock;
    });

    emergencySupplies = [{
        id: 'mockId',
        provider: 'user1',
        providerId: 'userId1',
        type: "food",
    },
    {
        id: 'mockId',
        provider: 'user1',
        providerId: 'userId1',
        type: "water",
    }];

    let filter = {
        id: 'mockId',
        provider: 'user1',
        providerId: 'userId1',
        type: "food",
    }
    let oneEmergencySupply = emergencySupplyModel.retrieveOneEmergencySupply(filter);
    expect(oneEmergencySupply).toHaveLength(1);
    expect(oneEmergencySupply[0]).toBe(emergencySupplies[0]);
});

test('It should be able to update the quantity of an emergencySupply', () => {
    jest.spyOn(EmergencySupply, 'findOneAndUpdate').mockImplementation((condition)=>{
        emergencySupplies.filter( m =>condition.provider === m.provider && condition.providerId === m.providerId && condition.type === m.type)
        .forEach( m => m.quantity = "8")
    });
    emergencySupplies = [{
        id: 'mockId',
        provider: 'user1',
        providerId: 'userId1',
        type: "food",
        quantity: "4",
        lastModifiedDate:"1647047122477",
    },
    {
        id: 'mockId',
        provider: 'user1',
        providerId: 'userId1',
        type: "water",
        quantity: "35",
        lastModifiedDate:"1647047122478",
    }];
    let mockCondition = {
        provider: 'user1',
        providerId: 'userId1',
        type: "food",
    }
    let update = {
        quantity: "8",
        lastModifiedDate: "1647047122479"
    }
    emergencySupplyModel.updateEmergencySupply(mockCondition,update);
    expect(emergencySupplies[0].quantity).toBe(update.quantity);
});

test('It should create one and only one instance', () => {
    let newEmergencySupplyModel = EmergencySupplyModel.getInstance(EmergencySupply);
    expect(emergencySupplyModel).toBe(newEmergencySupplyModel);
});