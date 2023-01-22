const ShelterRequestModel = require("../../../models/shelter/shelter.request.model.js");
const mongoose = require('mongoose');
const ShelterRequestSchema = require('../../../schema/shelter/shelter.request.schema.js').ShelterRequestSchema;
const ShelterRequest = mongoose.model('shelter_request', ShelterRequestSchema);
let shelterRequestModel = ShelterRequestModel.getInstance(ShelterRequest);

let requests;
let chainMock;

beforeAll(async () => {
    requests = [];
});


beforeEach(() => {
    jest.spyOn(ShelterRequest, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        sort: jest.fn(() => {
            requests.sort(function(a, b) {
                return a.createDate-b.createDate;
            });
            return chainMock;
        }),
        exec: jest.fn(() => {
            return requests;
        }),
    };
});



test('It should be able to create a request', ()=> {

    let spy = jest.spyOn(ShelterRequest, 'create').mockImplementation((sp)=>{
        requests.push(sp);
    });

    let request = {
        requestID: '6666f4a7-05dc-483d-a83d-a9558eacc56c',
        postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        requesterName: 'TestUser1',
        requesterID: 'b1ee2f40-24d4-4872-9143-43595491e004',
        approved: false,

        createDate: 1649574484,
        updateDate: 1649574484,

        description: 'Test Description Test Description Test Description Test Description Test Description',
        totalRoomNumRequest: 2,
        totalPeople: 5,
        BookDateBegin: 1649588888,
        BookDateEnd: 1649599999,
    };
    shelterRequestModel.createRequest(request);
    expect(requests[0]).toBe(request);

});


test('It should be able to read all requests', ()=>{
    requests = [
        // request1
        {
            requestID: '6666f4a7-05dc-483d-a83d-a9558eacc56c',
            postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            senderID: 'c375fd01-c762-4d31-a572-4cc697bdbc75',//yyn
            requesterName: 'cfl',
            requesterID: 'b1ee2f40-24d4-4872-9143-43595491e004',//cfl
            approved: false,

            createDate: 1649574484,
            updateDate: 1649574484,

            description: 'Test Description Test Description Test Description Test Description Test Description',
            totalRoomNumRequest: 2,
            totalPeople: 5,
            BookDateBegin: 1649588888,
            BookDateEnd: 1649599999,
        },

        // request2
        {
            requestID: '7777f4a7-05dc-483d-a83d-a9558eacc56c',
            postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            senderID: 'b1ee2f40-24d4-4872-9143-43595491e004',//cfl
            requesterName: 'TestUser2',
            requesterID: 'c375fd01-c762-4d31-a572-4cc697bdbc75',//yyn
            approved: true,

            createDate: 1649574484,
            updateDate: 1649574484,

            description: 'Test Description1 Test Description1 Test Description1 Test Description1 Test Description1',
            totalRoomNumRequest: 1,
            totalPeople: 3,
            BookDateBegin: 1649588888,
            BookDateEnd: 1649599999,
        },

    ];

    expect(shelterRequestModel.findRequests({})).toBe(requests);
});



test('It should be able to delete a request', ()=>{
    jest.spyOn(ShelterRequest, 'findOneAndDelete').mockImplementation((requestID)=>{
        requests = requests.filter(function(item, index, arr){
            return item.requestID !== requestID.requestID;
        });
    });

    requests = [
        // request1
        {
            requestID: '6666f4a7-05dc-483d-a83d-a9558eacc56c',
            postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            requesterName: 'TestUser1',
            requesterID: 'b1ee2f40-24d4-4872-9143-43595491e004',
            approved: false,

            createDate: 1649574484,
            updateDate: 1649574484,

            description: 'Test Description Test Description Test Description Test Description Test Description',
            totalRoomNumRequest: 2,
            totalPeople: 5,
            BookDateBegin: 1649588888,
            BookDateEnd: 1649599999,
        },

        // request2
        {
            requestID: '7777f4a7-05dc-483d-a83d-a9558eacc56c',
            postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            requesterName: 'TestUser2',
            requesterID: 'c1ee2f40-24d4-4872-9143-43595491e004',
            approved: true,

            createDate: 1649574484,
            updateDate: 1649574484,

            description: 'Test Description1 Test Description1 Test Description1 Test Description1 Test Description1',
            totalRoomNumRequest: 1,
            totalPeople: 3,
            BookDateBegin: 1649588888,
            BookDateEnd: 1649599999,
        },

    ];

    let afterDelete = [
        // request1
        {
            requestID: '6666f4a7-05dc-483d-a83d-a9558eacc56c',
            postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            requesterName: 'TestUser1',
            requesterID: 'b1ee2f40-24d4-4872-9143-43595491e004',
            approved: false,

            createDate: 1649574484,
            updateDate: 1649574484,

            description: 'Test Description Test Description Test Description Test Description Test Description',
            totalRoomNumRequest: 2,
            totalPeople: 5,
            BookDateBegin: 1649588888,
            BookDateEnd: 1649599999,
        },
    ];
    shelterRequestModel.deleteRequest(requests[1].requestID)
    expect(requests).toStrictEqual(afterDelete);
});


// TODO
test('It should be able to update a request', () => {
    jest.spyOn(ShelterRequest, 'findOneAndUpdate').mockImplementation((requestID, newRequest)=>{
        // the postID passed in is an object, take me so long to find it...
        let index = requests.findIndex((request) => request.requestID === requestID.requestID);
        requests[index] = newRequest;
    });
    requests = [
        // request1
        {
            requestID: '6666f4a7-05dc-483d-a83d-a9558eacc56c',
            postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            requesterName: 'TestUser1',
            requesterID: 'b1ee2f40-24d4-4872-9143-43595491e004',
            approved: false,

            createDate: 1649574484,
            updateDate: 1649574484,

            description: 'Test Description Test Description Test Description Test Description Test Description',
            totalRoomNumRequest: 2,
            totalPeople: 5,
            BookDateBegin: 1649588888,
            BookDateEnd: 1649599999,
        },

        // request2
        {
            requestID: '7777f4a7-05dc-483d-a83d-a9558eacc56c',
            postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
            requesterName: 'TestUser2',
            requesterID: 'c1ee2f40-24d4-4872-9143-43595491e004',
            approved: true,

            createDate: 1649574484,
            updateDate: 1649574484,

            description: 'Test Description1 Test Description1 Test Description1 Test Description1 Test Description1',
            totalRoomNumRequest: 1,
            totalPeople: 3,
            BookDateBegin: 1649588888,
            BookDateEnd: 1649599999,
        },

    ];

    let newRequest = {
        requestID: '7777f4a7-05dc-483d-a83d-a9558eacc56c',
        postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        requesterName: 'TestUser2',
        requesterID: 'c1ee2f40-24d4-4872-9143-43595491e004',
        approved: true,

        createDate: 1649574484,
        updateDate: 1649666666,

        description: 'Update Update Update Update Update Update Update ',
        totalRoomNumRequest: 1,
        totalPeople: 3,
        BookDateBegin: 1649588888,
        BookDateEnd: 1649599999,
    };
    shelterRequestModel.updateRequest(newRequest.requestID, newRequest);
    expect(requests[1]).toBe(newRequest);
});


test('It should create one and only one instance', () => {
    let newShelterRequestModel = ShelterRequestModel.getInstance(ShelterRequest);
    expect(shelterRequestModel).toBe(newShelterRequestModel);
});