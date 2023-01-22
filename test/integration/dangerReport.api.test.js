let agent = require('superagent');
const db = require('./in-memory-database.js');

let PORT = 8000;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app');
var server;
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
});

afterEach(async () => {
    await db.clearDatabase()
});

afterAll(async () => {
    await server.close();
    await db.closeDatabase();
});

test('DangerReport can post a new report',  (done) => {
    let mockRequest = {
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Fire'],
        description: 'mockMessage'
    }
    agent.post(HOST + '/dangerReports')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end((err, res) => {
            expect(res.status).toBe(201);
            expect(res.text).toEqual("new danger report has been created");
            done();
        });
});

test('DangerReport can get all reports', (done) => {
    let mockRequest = {
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Fire'],
        description: 'mockMessage'
    }
    agent.post(HOST + '/dangerReports')
        .set('authorization', "Bearer " + token)
        .send(mockRequest)
        .end(() => {
            agent.get(HOST + '/dangerReports')
                .set('authorization', "Bearer " + token)
                .send()
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    let jsonObj = JSON.parse(res.text);
                    expect(jsonObj).toHaveLength(1);
                    expect(jsonObj[0].title).toEqual(mockRequest.title);
                    expect(jsonObj[0].zipcode).toEqual(mockRequest.zipcode);
                    done();
                });
        });
});

test('DangerReport can update a report', async () => {
    let mockRequest = {
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Fire'],
        description: 'mockMessage'
    }
    let mockPutRequest = {
        updatedFields: {
            zipcode: '99999',
        }
    }
    await agent.post(HOST + '/dangerReports')
        .set('authorization', "Bearer " + token)
        .send(mockRequest);
    let reports = await agent.get(HOST + '/dangerReports')
                        .set('authorization', "Bearer " + token)
                        .send(mockRequest);

    let reportId = JSON.parse(reports.text)[0].id;
    let putRes = await agent.patch(HOST + '/dangerReports/' + reportId)
        .set('authorization', "Bearer " + token)
        .send(mockPutRequest);

    expect(putRes.status).toBe(200);

    reports = await agent.get(HOST + '/dangerReports')
        .set('authorization', "Bearer " + token)
        .send(mockRequest);

    let jsonObj = JSON.parse(reports.text)[0];
    expect(jsonObj.zipcode).toBe('99999');
});

test('DangerReport can delete a report', async () => {
    let mockRequest = {
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Fire'],
        description: 'mockMessage'
    }
    await agent.post(HOST + '/dangerReports')
        .set('authorization', "Bearer " + token)
        .send(mockRequest);

    let reports = await agent.get(HOST + '/dangerReports')
        .set('authorization', "Bearer " + token)
        .send(mockRequest);
    let reportId = JSON.parse(reports.text)[0].id;

    let deleteRes = await agent.delete(HOST + '/dangerReports/' + reportId)
        .set('authorization', "Bearer " + token)
        .send();

    expect(deleteRes.status).toBe(200);

    reports = await agent.get(HOST + '/dangerReports')
        .set('authorization', "Bearer " + token)
        .send(mockRequest);

    let jsonObj = JSON.parse(reports.text);
    expect(jsonObj.length).toBe(0);
});