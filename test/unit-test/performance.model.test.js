const PerformanceModel = require("../../models/performance.model.js");
const mongoose = require('mongoose');
const PerformanceSchema = require('../../schema/performance.schema.js').PerformanceSchema;
const Performance = mongoose.model('performance', PerformanceSchema);
let performanceModel = PerformanceModel.getInstance(Performance);

let performanceRecords;

beforeAll(async () => {
    performanceRecords = [];
    global.serverStatus = 1;
});

beforeEach(() => {
 
});

test('Should be able to get global server status as one', ()=>{
    let serverStatus = global.serverStatus;
    expect(performanceModel.getServerStatus()).toBe(serverStatus);
});

test('Start test should be able to return 2 when under test environment', ()=>{
    let testId = "testId";
    global.serverStatus = 2;
    let returnStatus = performanceModel.startTest(testId);
    expect(returnStatus).toBe(global.serverStatus);
});

test('Start test should be able to return 1 when under normal environment', ()=>{
    let testId = "testId";
    global.serverStatus = 1;
    const database = require("../../models/database.js");
    const switchDB = jest.fn()
    database.switchDB = switchDB;
    global.database = database;
    let returnStatus = performanceModel.startTest(testId);
    expect(returnStatus).toBe(global.serverStatus);
});

test('Stop test should be able to return 1 when under normal environment', ()=>{
    global.serverStatus = 1;
    let returnStatus = performanceModel.stopTest();
    expect(returnStatus).toBe(global.serverStatus);
});

test('Stop test should be able to return 2 when under test environment', ()=>{
    global.serverStatus = 2;
    const database = require("../../models/database.js");
    const switchDB = jest.fn()
    database.switchDB = switchDB;
    global.database = database;
    let returnStatus = performanceModel.stopTest();
    expect(returnStatus).toBe(global.serverStatus);
});

test('Should be able to save a record after test', ()=>{
    let record = {
        test: "test record",
        duration: 10
    }

    jest.spyOn(Performance, 'create').mockImplementation((r)=>{
        performanceRecords.push(r);
    });

    performanceModel.saveRecords(record);

    expect(performanceRecords[0]).toBe(record);
});

test('It should create one and only one instance', () => {
    let newPerformanceModel = PerformanceModel.getInstance(Performance);
    expect(performanceModel).toBe(newPerformanceModel);
});
