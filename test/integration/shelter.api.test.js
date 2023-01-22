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

let mockPost =  {
    postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
    sender: 'TestUser1',
    senderId: 'b1ee2f40-24d4-4872-9143-43595491e004',
    assignees: [
        {
            assigneeName: 'TestAssignee1',
            assigneeID: 'b1ee2f40-24d4-4872-9143-43595491e005',
            roomNum: 1,
            roomIDs: [{
                roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc75',
            }]
        },
        {
            assigneeName: 'TestAssignee2',
            assigneeID: 'b1ee2f40-24d4-4872-9143-43595491e006',
            roomNum: 2,
            roomIDs: [{
                roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc76',
            },
                {
                    roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc77',
                },]
        },
    ],

    postCreateDate: 1649574484,
    postUpdateDate: 1649575484,
    description: 'Test Description Test Description Test Description Test Description Test Description',
    totalRoomNum: 4,
    availableRoomNum: 1,
    roomInfo: [
        {
            roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc75',
            availableDateBegin: 1649574484,
            availableDateEnd: 1649747284,
            assigned: false
        },
        {
            roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc75',
            availableDateBegin: 1649574484,
            availableDateEnd: 1650006484,
            assigned: false
        },
        {
            roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc76',
            availableDateBegin: 1649574484,
            availableDateEnd: 1650006484,
            assigned: false
        },
        {
            roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc77',
            availableDateBegin: 1649574484,
            availableDateEnd: 1650006484,
            assigned: false
        },
        {
            roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc78',
            availableDateBegin: 1649574484,
            availableDateEnd: 1650006484,
            assigned: false
        },
    ],

    shelterAddress: 'Moffet Field Building 23, Mountain View, CA, 94040',
};

let mockRequest = {
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

// ********************* POST ZONE ************************
test('User can send a post in shelter directory', ()=>{
    agent.post(HOST + '/shelters/newpost')
        .set('authorization', "Bearer " + token)
        .send(mockPost)
        .end((err, res) => {
            expect(res.status).toBe(201);
            expect(res.text).toEqual('user ' + mockPost.sender + ' create a shelter post');
        });
});

test('User can get all posts in shelter directory',  (done) => {
    agent.post(HOST + '/shelters/newpost')
        .set('authorization', "Bearer " + token)
        .send(mockPost)
        .end(() => {
            agent.get(HOST + '/shelters/post')
                .set('authorization', "Bearer " + token)
                .query()
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    let jsonObj = JSON.parse(res.text);
                    expect(jsonObj.data).toHaveLength(1);
                    expect(jsonObj.data[0].senderId).toEqual(mockPost.senderId);
                    expect(jsonObj.data[0].sender).toEqual(mockPost.sender);
                    expect(jsonObj.data[0].description).toEqual(mockPost.description);
                    done();
                });
        });
});

test('User can NOT get any post matching the criteria', async () => {
    await agent.post(HOST + '/shelters/newpost')
        .set('authorization', "Bearer " + token)
        .send(mockPost)

    let res = await agent.get(HOST + '/shelters/post')
        .set('authorization', "Bearer " + token)
        .query({senderId: 'bbbbbbbb-24d4-4872-9143-43595491e004'})

    expect(res.status).toBe(204);

});

test('User can update a post in shelter directory',  async ()=>{
    await agent
        .post(HOST + '/shelters/newpost')
        .set('authorization', "Bearer " + token)
        .send(mockPost)

    let record = await agent
        .get(HOST + '/shelters/post')
        .set('authorization', "Bearer " + token)

    let obj = JSON.parse(record.res.text);

    let jsonObj = {
        postID: obj.data[0].postID,
        newPostField: {
            shelterAddress: "here",
            description: 'update update update'
        }
    };

    let rec = await agent
        .post(HOST + '/shelters/post')
        .set('authorization', "Bearer " + token)
        .send(jsonObj)

    obj = JSON.parse(rec.res.text);
    expect(obj.code).toBe("200");
    expect(obj.data.postID).toBe(jsonObj.postID);
    expect(obj.data.sender).toBe(mockPost.sender);
});

test('User can NOT update a post that does not exist',  async ()=>{
    await agent
        .post(HOST + '/shelters/newpost')
        .set('authorization', "Bearer " + token)
        .send(mockPost)

    let jsonObj = {
        postID: "2fbcf4a7-05dc-483d-a83d-a9558eacc56c",
        newPostField: {
            shelterAddress: "here",
            description: 'update update update'
        }
    };

    agent
        .post(HOST + '/shelters/post')
        .set('authorization', "Bearer " + token)
        .send(jsonObj)
        .end((err, res) => {
            expect(res.status).toBe(204);
        });
});

test('User can delete a post in shelter directory', async ()=>{
    await agent
        .post(HOST + '/shelters/newpost')
        .set('authorization', "Bearer " + token)
        .send(mockPost)

    let record = await agent
        .get(HOST + '/shelters/post')
        .set('authorization', "Bearer " + token)

    let obj = JSON.parse(record.res.text);
    let postID = obj.data[0].postID;
    await agent.delete(HOST + '/shelters/post')
        .set('authorization', "Bearer " + token)
        .send({postID: postID})
        .end((err, res) => {
            expect(res.status).toBe(200);
        });
});

test('User can NOT delete a post that does not exist', async ()=>{
    await agent
        .post(HOST + '/shelters/newpost')
        .set('authorization', "Bearer " + token)
        .send(mockPost)

    let postID = '11111111-24d4-4872-9143-43595491e004';
    await agent.delete(HOST + '/shelters/post')
        .set('authorization', "Bearer " + token)
        .send({postID: postID})
        .end((err, res) => {
            expect(res.status).toBe(204);
        });
});


// ********************* REQUEST ZONE ************************
test('User can send a request in shelter directory', async () => {
    agent.post(HOST + '/shelters/newrequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            expect(res.text).toEqual('user ' + mockRequest.requesterName+ ' create a shelter request');
        });
});

test('User can get requests matching the criteria',  (done) => {
    agent.post(HOST + '/shelters/newrequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end(() => {
            agent.get(HOST + '/shelters/request')
                .set('authorization', "Bearer " + token)
                .query({filter: {requesterID: 'b1ee2f40-24d4-4872-9143-43595491e004'}})
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    let jsonObj = JSON.parse(res.text);
                    expect(jsonObj.data).toHaveLength(1);
                    expect(jsonObj.data[0].requesterID).toEqual(mockRequest.requesterID);
                    expect(jsonObj.data[0].requesterName).toEqual(mockRequest.requesterName);
                    expect(jsonObj.data[0].description).toEqual(mockRequest.description);
                    done();
                });
        });
});

test('User can NOT get requests matching the criteria',  (done) => {
    agent.post(HOST + '/shelters/newrequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end(() => {
            agent.get(HOST + '/shelters/request')
                .set('authorization', "Bearer " + token)
                .query({filter: {requesterID: 'bbbbbbbb-24d4-4872-9143-43595491e004'}})
                .end((err, res) => {
                    expect(res.status).toBe(204);
                    done();
                });
        });
});

test('User can update a request in shelter directory',  async ()=>{
    await agent
        .post(HOST + '/shelters/newrequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)

    let record = await agent
        .get(HOST + '/shelters/request')
        .set('authorization', "Bearer " + token)
        .query({filter: {requesterName: 'TestUser1'}})

    let obj = JSON.parse(record.res.text);
    let jsonObj = {
        requestID: obj.data[0].requestID,
        newPostField: {
            description: 'update2 update2 update2'
        }
    };

    let rec = await agent
        .post(HOST + '/shelters/request')
        .set('authorization', "Bearer " + token)
        .send(jsonObj)
    obj = JSON.parse(rec.res.text);
    expect(obj.code).toBe("200");
    expect(obj.data.requestID).toBe(jsonObj.requestID);
    expect(obj.data.approved).toBe(mockRequest.approved);
});

test('User can NOT update a request that does not exist',  async ()=>{
    await agent
        .post(HOST + '/shelters/newrequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)

    let jsonObj = {
        requestID: "22222222-05dc-483d-a83d-a9558eacc56c",
        newPostField: {
            description: 'update2 update2 update2'
        }
    };
    agent
        .post(HOST + '/shelters/request')
        .set('authorization', "Bearer " + token)
        .send(jsonObj)
        .end((err, res) => {
            expect(res.status).toBe(204);
        });

});

test('User can delete a request in shelter directory', async ()=>{
    await agent
        .post(HOST + '/shelters/newrequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)

    let record = await agent
        .get(HOST + '/shelters/request')
        .set('authorization', "Bearer " + token)

    let obj = JSON.parse(record.res.text);
    let requestID = obj.data[0].requestID;
    await agent.delete(HOST + '/shelters/request')
        .set('authorization', "Bearer " + token)
        .send({requestID: requestID})
        .end((err, res) => {
            expect(res.status).toBe(200);
        });
});

test('User can NOT delete a request that does not exist', async ()=>{
    await agent
        .post(HOST + '/shelters/newrequest')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)

    let requestID = '11111111-24d4-4872-9143-43595491e004';
    await agent.delete(HOST + '/shelters/request')
        .set('authorization', "Bearer " + token)
        .send({requestID: requestID})
        .end((err, res) => {
            expect(res.status).toBe(204);
        });
});