const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const ShelterPostModel = require("../models/shelter/shelter.post.model.js");
const ShelterRequestModel = require("../models/shelter/shelter.request.model.js");
const mongoose = require('mongoose');
const ShelterPostSchema = require('../schema/shelter/shelter.post.schema.js').ShelterPostSchema;
const ShelterRequestSchema = require('../schema/shelter/shelter.request.schema.js').ShelterRequestSchema;
const ShelterPost = mongoose.model('shelter_post', ShelterPostSchema);
const ShelterRequest = mongoose.model('shelter_request', ShelterRequestSchema);
const performanceCheck = require("../middlewares/performance.check.js").performanceCheck;
const Response = require('./response.js');

class ShelterController {

    shelterPostModel;
    shelterRequestModel;

    constructor(shelterPostModel, shelterRequestModel){
        this.shelterPostModel = shelterPostModel;
        this.shelterRequestModel = shelterRequestModel;

        Router.post("/newpost", jwttoken.authenticateToken, performanceCheck, this.createPost);  // C
        Router.get("/post", jwttoken.authenticateToken, performanceCheck, this.getPosts);  // R
        Router.post("/post", jwttoken.authenticateToken, performanceCheck, this.updatePost);  // U
        Router.delete("/post", jwttoken.authenticateToken, performanceCheck, this.deletePost);  // D
        Router.post("/newrequest", jwttoken.authenticateToken, performanceCheck, this.createRequest);  // C
        Router.get("/request", jwttoken.authenticateToken, performanceCheck, this.getRequests);  // R
        Router.post("/request", jwttoken.authenticateToken, performanceCheck, this.updateRequest);  // U
        Router.delete("/request", jwttoken.authenticateToken, performanceCheck, this.deleteRequest);  // D
    }

    // **************** POST ZONE ********************
    createPost = async (req, res) => {
        const sender = req.body.sender;
        const senderId = req.body.senderId;
        const description = req.body.description;
        const totalRoomNum = req.body.totalRoomNum;
        let roomInfo = req.body.roomInfo;
        const shelterAddress = req.body.shelterAddress;

        for (let i = 0; i < roomInfo.length; i++) {
            roomInfo[i].roomID = uuid()
        }

        let newPost = {
            postID: uuid(),
            sender: sender,
            senderId: senderId,
            assignees: [], // array
            postCreateDate: Date.now(),
            postUpdateDate: Date.now(),
            description: description,
            totalRoomNum: totalRoomNum, // int
            availableRoomNum: totalRoomNum, // int
            roomInfo: roomInfo, // array
            shelterAddress: shelterAddress,
        };

        let post = await this.shelterPostModel.createPost(newPost);
        req.io.emit('post change', JSON.stringify(post)); // broadcast to all
        res.status(201).send('user ' + sender + ' create a shelter post');
    };

    getPosts = async (req, res) => {
        const filter = req.query;
        let posts = await this.shelterPostModel.findPosts(filter);
        if (posts.length === 0) {
            res.status(204).send({
                message: "no posts found"
            });
            return;
        }
        Response.code = "200";
        Response.data = posts;
        res.status(200).send(JSON.stringify(Response));
    };

    updatePost = async (req, res) => {
        const postID = req.body.postID;
        let newPostField = req.body.newPostField;
        newPostField["postUpdateDate"] = Date.now();
        let updatedPost = await this.shelterPostModel.updatePost(postID, newPostField);
        if (updatedPost == null) {
            res.status(204).send({
                message: "no target post found and update failed"
            });
            return;
        }
        Response.code = "200";
        Response.data = updatedPost;
        res.status(200).send(JSON.stringify(Response));
    };

    deletePost = async (req, res) => {
        const postID = req.body.postID;
        let result = await this.shelterPostModel.deletePost(postID);
        if (result == null) {
            res.status(204).send({
                message: "no post found to delete"
            });
            return;
        }
        Response.code = "200";
        // Response.data = ok;
        req.io.emit('post change', JSON.stringify(postID)); // broadcast to all
        res.status(200).send(JSON.stringify(Response));
    };

    // **************** REQUEST ZONE ********************
    createRequest = async (req, res) => {
        const postID = req.body.postID;
        const requesterName = req.body.requesterName;

        const targetPost = await this.shelterPostModel.findPosts({postID: postID});

        let newRequest = {
            requestID: uuid(),
            postID: postID,
            senderName: req.body.senderName,
            senderID: req.body.senderID,
            requesterName: requesterName,
            requesterID: req.body.requesterID,
            approved: false,
            requestCreateDate: Date.now(),
            requestUpdateDate: Date.now(),
            description: req.body.description,
            totalRoomNumRequest: req.body.totalRoomNumRequest,
            roomIDs: req.body.roomIDs,
            totalPeople: req.body.totalPeople,
            BookDateBegin: req.body.BookDateBegin,
            BookDateEnd: req.body.BookDateEnd,
        };

        let request = await this.shelterRequestModel.createRequest(newRequest);
        req.io.to(targetPost.senderId).emit('new request', JSON.stringify(request)); // emit to the provider
        res.status(201).send('user ' + requesterName + ' create a shelter request');
    };

    getRequests = async (req, res) => {
        const filter = req.query.filter;
        let requests = await this.shelterRequestModel.findRequests(filter);
        if (requests.length === 0) {
            res.status(204).send({
                message: "no requests found"
            });
            return;
        }
        Response.code = "200";
        Response.data = requests;
        res.status(200).send(JSON.stringify(Response));
    }

    updateRequest = async (req, res) => {
        const requestID = req.body.requestID;
        const newRequestField = req.body.newRequestField;

        let updatedRequest = await this.shelterRequestModel.updateRequest(requestID, newRequestField);
        if (updatedRequest == null) {
            res.status(204).send({
                message: "no target request found and update failed"
            });
            return;
        }
        Response.code = "200";
        Response.data = updatedRequest;
        res.send(JSON.stringify(Response));
    };

    deleteRequest = async (req, res) => {
        const requestID = req.body.requestID;
        let result = await this.shelterRequestModel.deleteRequest(requestID);
        if (result == null) {
            res.status(204).send({
                message: "no request found to delete"
            });
            return;
        }
        Response.code = "200";
        Response.data = result;
        res.status(200).send(JSON.stringify(Response));
    };

}

let shelterPostModel = ShelterPostModel.getInstance(ShelterPost);
let shelterRequestModel = ShelterRequestModel.getInstance(ShelterRequest);
let shelterController = new ShelterController(shelterPostModel, shelterRequestModel);
module.exports = Router;
