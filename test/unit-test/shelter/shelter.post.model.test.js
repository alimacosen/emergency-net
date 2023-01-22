const ShelterPostModel = require("../../../models/shelter/shelter.post.model.js");
const mongoose = require('mongoose');
const ShelterPostSchema = require('../../../schema/shelter/shelter.post.schema.js').ShelterPostSchema;
const ShelterPost = mongoose.model('shelter_post', ShelterPostSchema);
let shelterPostModel = ShelterPostModel.getInstance(ShelterPost);

let posts;
let chainMock;

beforeAll(async () => {
    posts = [];
});


beforeEach(() => {
    jest.spyOn(ShelterPost, 'find').mockImplementation(()=>{
        return chainMock;
    });

    chainMock = {
        sort: jest.fn(() => {
            posts.sort(function(a, b) {
                return a.updateDate-b.updateDate;
            });
            return chainMock;
        }),
        exec: jest.fn(() => {
            return posts;
        }),
    };
});



test('It should be able to create a post', ()=> {

    let spy = jest.spyOn(ShelterPost, 'create').mockImplementation((sp)=>{
        posts.push(sp);
    });

    let post = {
        postID: '2fbcf4a7-05dc-483d-a83d-a9558eacc56c',
        sender: 'TestUser',
        senderId: 'b1ee2f40-24d4-4872-9143-43595491e004',
        assignees: [
        {
            assigneeName: 'TestAssignee1',
            assigneeID: 'b1ee2f40-24d4-4872-9143-43595491e005',
            roomNum: 1,
            roomIDs: [{
                roomID: 'e1ee2f40-24d4-4872-9143-43595491e005',
            }]
        },
        {
            assigneeName: 'TestAssignee2',
            assigneeID: 'b1ee2f40-24d4-4872-9143-43595491e006',
            roomNum: 2,
            roomIDs: [{
                roomID: 'f1ee2f40-24d4-4872-9143-43595491e005',
            }]
        },
        ],

        createDate: 1649574484,
        updateDate: 1649575484,
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
    shelterPostModel.createPost(post);
    expect(posts[0]).toBe(post);

});


test('It should be able to read all posts', ()=>{
    posts = [
        // post1
        {
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

            createDate: 1649574484,
            updateDate: 1649575484,
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
        },

        // post2
        {
            postID: '77bcf4a7-05dc-483d-a83d-a9558eacc56c',
            sender: 'TestUser2',
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

            createDate: 1649574484,
            updateDate: 1649575484,
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

            shelterAddress: 'Moffet Field Building 24, Mountain View, CA, 94041',
        },

    ];

    expect(shelterPostModel.findPosts({})).toBe(posts);
});



test('It should be able to delete a post', ()=>{
    jest.spyOn(ShelterPost, 'findOneAndDelete').mockImplementation((postID)=>{
        posts = posts.filter(function(item, index, arr){
            return item.postID !== postID.postID;
        });
    });

    posts = [
        // post1
        {
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

            createDate: 1649574484,
            updateDate: 1649575484,
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
        },

        // post2
        {
            postID: '77bcf4a7-05dc-483d-a83d-a9558eacc56c',
            sender: 'TestUser2',
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

            createDate: 1649574484,
            updateDate: 1649575484,
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

            shelterAddress: 'Moffet Field Building 24, Mountain View, CA, 94041',
        },

    ];

    let afterDelete = [
        // post1
        {
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

            createDate: 1649574484,
            updateDate: 1649575484,
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
        },
    ];
    shelterPostModel.deletePost(posts[1].postID)
    expect(posts).toStrictEqual(afterDelete);
});



test('It should be able to update a post', () => {
    jest.spyOn(ShelterPost, 'findOneAndUpdate').mockImplementation((postID, newPost)=>{
        // the postID passed in is an object, take me so long to find it...
        let index = posts.findIndex((post) => post.postID === postID.postID);
        posts[index] = newPost;
    });

    posts = [
        // post1
        {
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

            createDate: 1649574484,
            updateDate: 1649575484,
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
        },

        // post2
        {
            postID: '77bcf4a7-05dc-483d-a83d-a9558eacc56c',
            sender: 'TestUser2',
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

            createDate: 1649574484,
            updateDate: 1649575484,
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

            shelterAddress: 'Moffet Field Building 24, Mountain View, CA, 94041',
        },

    ];

    let newPost = {
        postID: '77bcf4a7-05dc-483d-a83d-a9558eacc56c',
        sender: 'TestUser2',
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
                }]
            },
            {
                assigneeName: 'TestAssignee3',
                assigneeID: 'b1ee2f40-24d4-4872-9143-43595491e007',
                roomNum: 1,
                roomIDs: [{
                    roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc78',
                }]
            },
        ],

        createDate: 1649574484,
        updateDate: 1649585484,
        description: 'Test Description1 Test Description2 Test Description3 Test Description4 Test Description5',
        totalRoomNum: 4,
        availableRoomNum: 0,
        roomInfo: [
            {
                roomID: 'c375fd01-c762-4d31-a572-4cc697bdbc75',
                availableDateBegin: 1649574484,
                availableDateEnd: 1649747284,
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
    shelterPostModel.updatePost(newPost.postID, newPost);
    expect(posts[1]).toBe(newPost);
});


test('It should create one and only one instance', () => {
    let newShelterPostModel = ShelterPostModel.getInstance(ShelterPost);
    expect(shelterPostModel).toBe(newShelterPostModel);
});