const UserStatusModelTest = require("../../models/userStatus.model.js");
const mongoose = require('mongoose');
const UserStatusSchema = require('../../schema/userStatus.schema.js').UserStatusSchema;
const UserStatus = mongoose.model('userStatus', UserStatusSchema);
let userStatusModel = UserStatusModelTest.getInstance(UserStatus);

let userStatusHistory;

beforeEach(() => {
    userStatusHistory = [];
    jest.spyOn(UserStatus, 'create').mockImplementation((userStatus) => {
        userStatusHistory.push(userStatus);
    });
    const chainMock = {
        exec: jest.fn(() => {
            return userStatusHistory;
        }),
    };
});

test('It should be able to create a userStatus', () => {
    let mockUserStatus = {
        id: 'mockId',
        userIds: 'mockUserId',
        timestamp: Date.now(),
        userStatus: 'OK'
    };
    userStatusModel.addUserStatus(mockUserStatus);
    expect(userStatusHistory[0]).toBe(mockUserStatus);
});

test('It should create one and only one instance', () => {
    let newUserStatusModel = UserStatusModelTest.getInstance(UserStatus);
    expect(userStatusModel).toBe(newUserStatusModel);
});