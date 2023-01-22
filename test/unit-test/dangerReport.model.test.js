const DangerReportModelTest = require("../../models/dangerReport.model");
const mongoose = require('mongoose');
const DangerReportSchema = require('../../schema/dangerReport.schema.js').DangerReportSchema;
const DangerReport = mongoose.model('dangerReport', DangerReportSchema);
let dangerReportModel = DangerReportModelTest.getInstance(DangerReport);

let dangerReports;
let chainMock;

beforeEach(() => {
    dangerReports = [];
    jest.spyOn(DangerReport, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        sort: jest.fn(() => {
            dangerReports.sort(function(a, b) {
                return a.createDate-b.createDate;
            });
            return chainMock;
        }),
        exec: jest.fn(() => {
            return dangerReports;
        }),
    };
});

test('It should be able to get all danger reports', () => {
    let newReport1 = {
        id: 'id1',
        creater: 'test1',
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Bombs'],
        description: 'something',
        createDate: Date.now()
    };
    let newReport2 = {
        id: 'id2',
        creater: 'test2',
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Bombs'],
        description: 'something',
        createDate: Date.now()
    };
    dangerReports.push(newReport1);
    dangerReports.push(newReport2);
    let getReports = dangerReportModel.getDangerReports();
    expect(getReports.length).toBe(2);
    expect(getReports[0]).toBe(newReport1);
    expect(getReports[1]).toBe(newReport2);
});

test('It should be able to create a danger report', ()=>{

    jest.spyOn(DangerReport, 'create').mockImplementation((a)=>{
        dangerReports.push(a);
    });

    let newReport = {
        id: 'id',
        creater: 'test1',
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Bombs'],
        description: 'something',
        createDate: Date.now()
    };
    dangerReportModel.createDangerReport(newReport);
    expect(dangerReports[0]).toBe(newReport);

});

test('It should be able to update a danger report', () => {

    jest.spyOn(DangerReport, 'findOneAndUpdate').mockImplementation((id, fields)=>{
        let report = dangerReports.find(report => report.id === id.id);
        let updatedFields = fields.$set
        for (const [key, value] of Object.entries(updatedFields)) {
            report[key] = value;
        }
        return chainMock;
    });

    let newReport1 = {
        id: 'id1',
        creater: 'test1',
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Bombs'],
        description: 'something',
        createDate: Date.now()
    };
    let newReport2 = {
        id: 'id2',
        creater: 'test2',
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Bombs'],
        description: 'something',
        createDate: Date.now()
    };
    dangerReports.push(newReport1);
    dangerReports.push(newReport2);
    let updatedFields = {
        title: 'updatedTitle'
    }
    dangerReportModel.updateDangerReport('id2', updatedFields);
    expect(dangerReports[1].title).toBe(updatedFields.title);
});

test('It should be able to delete a danger report', () => {
    jest.spyOn(DangerReport, 'findOneAndRemove').mockImplementation((id, fields)=>{
        let report = dangerReports.find(report => report.id === id.id);
        const index = dangerReports.indexOf(report);
        if (index > -1) {
            dangerReports.splice(index, 1);
        }
        return chainMock;
    });

    let newReport1 = {
        id: 'id1',
        creater: 'test1',
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Bombs'],
        description: 'something',
        createDate: Date.now()
    };
    let newReport2 = {
        id: 'id2',
        creater: 'test2',
        title: 'title',
        zipcode: '11111',
        dangerItems: ['Bombs'],
        description: 'something',
        createDate: Date.now()
    };
    dangerReports.push(newReport1);
    dangerReports.push(newReport2);
    dangerReportModel.deleteDangerReport('id2');
    expect(dangerReports.length).toBe(1);
    expect(dangerReports[0].id).toBe(newReport1.id);
});