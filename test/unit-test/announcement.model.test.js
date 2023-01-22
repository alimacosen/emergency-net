const AnnouncementModelTest = require("../../models/announcement.model.js");
const mongoose = require('mongoose');
const ChatroomModel = require("../../models/chatroom.model");
const AnnouncementSchema = require('../../schema/announcement.schema.js').AnnouncementSchema;
const Announcement = mongoose.model('announcement', AnnouncementSchema);
let announcementModel = AnnouncementModelTest.getInstance(Announcement);

let announcements;
let chainMock;

beforeAll(async () => {
    announcements = [];
});

beforeEach(() => {
    jest.spyOn(Announcement, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        sort: jest.fn(() => {
            announcements.sort(function(a, b) {
                return a.createDate-b.createDate;
            });
            return chainMock;
        }),
        limit: jest.fn((num) => {
            announcements = announcements.slice(0, num);
            return chainMock;
        }),
        exec: jest.fn(() => {
            return announcements;
        }),
    };
});

test('It should be able to save an announcement', ()=>{

    let spy = jest.spyOn(Announcement, 'create').mockImplementation((a)=>{
        announcements.push(a);
    });

    let announcement = {
        id: 'faab606a-8688-4f47-9ac9-d6e3c4110ac3',
        sender: 'cfl',
        senderId: 'b1ee2f40-24d4-4872-9143-43595491e004',
        content: 'test post an announcement',
        createDate: 1648632849,
        senderStatus: 'Help',
    };
    announcementModel.createAnnouncement(announcement);
    expect(announcements[0]).toBe(announcement);

});

test('It should be able to retrieve all announcements', ()=>{
    announcements = [{
        id: 'faab606a-8688-4f47-9ac9-d6e3c4110ac3',
        sender: 'cfl',
        senderId: 'b1ee2f40-24d4-4872-9143-43595491e004',
        content: 'test post an announcement',
        createDate: 1648632849,
        senderStatus: 'Help',
    },{
        id: '18ca9554-94c5-4654-b435-215f3b60d78d',
        sender: 'cfl',
        senderId: 'b1ee2f40-24d4-4872-9143-43595491e004',
        content: 'this is another announcement',
        createDate: 1648633773,
        senderStatus: 'Help',
    },
    ];

    expect(announcementModel.retrieveAnnouncements()).toBe(announcements);
});

test('It should create one and only one instance', () => {
    let newAnnouncementModel = AnnouncementModelTest.getInstance(Announcement);
    expect(announcementModel).toBe(newAnnouncementModel);
});