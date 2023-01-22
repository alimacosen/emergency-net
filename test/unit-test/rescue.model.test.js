const RescueModel = require("../../models/rescue.model.js");
const mongoose = require('mongoose');
const RescueSchema = require('../../schema/rescue.schema.js').RescueSchema;
const Rescue = mongoose.model('rescue', RescueSchema);
let rescueModel = RescueModel.getInstance(Rescue);

let rescues;

beforeAll(async () => {
    jest.spyOn(Rescue, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        where: jest.fn((attribute) => {
            return chainMock;
        }),
        equals: jest.fn((roomID) => {
            messages = messages.filter(item=>item.roomId === roomID);
            return chainMock;
        }),
        sort: jest.fn(() => {
            rescues.sort(function(a, b) {
                return b.updateDate-a.updateDate;
            });
            return chainMock;
        }),
        limit: jest.fn((num) => {
            messages = messages.slice(0, num);
            return chainMock;
        }),
        exec: jest.fn(() => {
            return rescues;
        }),
    };
});

beforeEach(() => {
    rescues = [];
});

test('Should be able to find all rescues in sorted', ()=>{
    rescues = [{
        "id": "a7e03b09-a06e-40fa-aa19-b929ec7b1572",
        "citizenId": "8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab",
        "citizenName": "test3",
        "place": "San Francisco",
        "citizenLongitude": -122.419416,
        "citizenLatitude": 37.774929,
        "rescueStatus": 3,
        "createDate":1647047122477,
        "updateDate":1647047122477,
    },{
        "id": "977fed11-205d-4f65-94cc-241ea6af20ec",
        "citizenId": "8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab",
        "citizenName": "test2",
        "place": "San Francisco",
        "citizenLongitude": -122.419416,
        "citizenLatitude": 37.774929,
        "rescueStatus": 3,
        "createDate":1647047122477,
        "updateDate":1647047122478,
    },{
        "id": "ba439eeb-909e-4d36-8f04-f3d404203f72",
        "citizenId": "8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab",
        "citizenName": "test1",
        "place": "San Francisco",
        "citizenLongitude": -122.419416,
        "citizenLatitude": 37.774929,
        "rescueStatus": 3,
        "createDate":1647047122477,
        "updateDate":1647047122479,
    }];
    let result = rescueModel.getAllRescues();
    expect(result[0].citizenName).toBe("test1");
    expect(result[1].citizenName).toBe("test2");
    expect(result[2].citizenName).toBe("test3");
});

test('Should be able to find one rescue by id', ()=>{
    rescues = [{
        "id": "a7e03b09-a06e-40fa-aa19-b929ec7b1572",
        "citizenId": "8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab",
        "citizenName": "test3",
        "place": "San Francisco",
        "citizenLongitude": -122.419416,
        "citizenLatitude": 37.774929,
        "rescueStatus": 3,
        "createDate":1647047122477,
        "updateDate":1647047122477,
    }];

    let spy = jest.spyOn(Rescue, 'findOne').mockImplementation((rule)=>{
        let id = rule.id;
        for (let i = 0; i < rescues.length; i++) {
            if(rescues[i].id === id){
                return rescues[i];
            }
        }
        return null;
    });

    let result = rescueModel.getRescue("a7e03b09-a06e-40fa-aa19-b929ec7b1572");
    result.then(function(result){
        expect(result.id).toBe("a7e03b09-a06e-40fa-aa19-b929ec7b1572");
    });
});

test('Should be able to create one rescue record', ()=>{
    let spy = jest.spyOn(Rescue, 'create').mockImplementation((r)=>{
        rescues.push(r);
    });

    rescueModel.createOneRescue({
        "id": "a7e03b09-a06e-40fa-aa19-b929ec7b1572",
        "citizenId": "8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab",
        "citizenName": "test3",
        "place": "San Francisco",
        "citizenLongitude": -122.419416,
        "citizenLatitude": 37.774929,
        "rescueStatus": 3,
        "createDate":1647047122477,
        "updateDate":1647047122477,
    });

    expect(rescues.length).toBe(1);
    expect(rescues[0].id).toBe("a7e03b09-a06e-40fa-aa19-b929ec7b1572");
});

test('Should be able to check the record has existed', async ()=>{
    rescues = [{
        "id": "a7e03b09-a06e-40fa-aa19-b929ec7b1572",
        "citizenId": "8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab",
        "citizenName": "test3",
        "place": "San Francisco",
        "citizenLongitude": -122.419416,
        "citizenLatitude": 37.774929,
        "rescueStatus": 0,
        "createDate":1647047122477,
        "updateDate":1647047122477,
    }];

    let spy = jest.spyOn(Rescue, 'findOne').mockImplementation((rule)=>{
        for (let i = 0; i < rescues.length; i++) {
            if((rescues[i].rescueStatus === 0 || rescues[i].rescueStatus === 1) && rescues[i].citizenId === rule.citizenId){
                return rescues[i];
            }
        }
        return null;
    });

    let result = await rescueModel.rescueHasExisted("8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab");
    expect(result).toBe(true);
});

test('Should be able to check the record has existed', async ()=>{
    let spy = jest.spyOn(Rescue, 'findOne').mockImplementation((rule)=>{
        for (let i = 0; i < rescues.length; i++) {
            if((rescues[i].rescueStatus === 0 || rescues[i].rescueStatus === 1) && rescues[i].citizenId === rule.citizenId){
                return rescues[i];
            }
        }
        return null;
    });

    let result = await rescueModel.rescueHasExisted({ citizenId:"8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab", 
        $or: [
            { rescueStatus:0},
            { rescueStatus:1 } 
        ]
    });
    expect(result).toBe(false);
});

test('Should be able to confrim the rescue', async ()=>{
    let spy = jest.spyOn(Rescue, 'findOneAndUpdate').mockImplementation((filter, update)=>{
        for (let i = 0; i < rescues.length; i++) {
            if(rescues[i].id === filter.id){
                rescues[i].rescueStatus = update.rescueStatus;
                rescues[i].updateDate = update.updateDate;
                return rescues[i];
            }
        }
        return null;
    });
    rescues = [{
        "id": "a7e03b09-a06e-40fa-aa19-b929ec7b1572",
        "citizenId": "8c3f2c21-90e8-42a0-a20f-003d1ea0e9ab",
        "citizenName": "test3",
        "place": "San Francisco",
        "citizenLongitude": -122.419416,
        "citizenLatitude": 37.774929,
        "rescueStatus": 0,
        "createDate":1647047122477,
        "updateDate":1647047122477,
    }];

    let result = await rescueModel.confirmRescue("a7e03b09-a06e-40fa-aa19-b929ec7b1572", 1);
    expect(result.rescueStatus).toBe(1);
});

test('It should create one and only one instance', () => {
    let newRescueModel = RescueModel.getInstance(Rescue);
    expect(rescueModel).toBe(newRescueModel);
});

