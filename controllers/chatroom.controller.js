const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const ChatroomModel = require("../models/chatroom.model.js");
const mongoose = require('mongoose');
const ChatroomSchema = require('../schema/chatroom.schema.js').ChatroomSchema;
const Chatroom = mongoose.model('chatroom', ChatroomSchema);

class ChatroomController{
    chatroomModel;

    constructor(chatroomModel){
        this.chatroomModel = chatroomModel;
        Router.get("/public",jwttoken.authenticateToken,this.findPublicRoom);
        Router.get("/private/:chatroomId",jwttoken.authenticateToken,this.findPrivateRoomByRoom);
        Router.get("/private/:userId1/:userId2",jwttoken.authenticateToken,this.findPrivateRoom);
        Router.post("/public",jwttoken.authenticateToken, this.generatePublicRoom);
        Router.post("/private/:userId1/:userId2",jwttoken.authenticateToken, this.launchRoom);
    }

    launchRoom = async (req, res) => {
        const userIds = req.body.userIds;
        let newChatroom = {
            id: uuid(),
            userIds:userIds,
            creater:userIds[0]
        }
        let newRoom = await this.chatroomModel.createChatroom(newChatroom);
        res.status(201).send(JSON.stringify(newRoom));
    };

    findPrivateRoomByRoom= async (req, res) => {
        const chatroomId = req.params.chatroomId;
        let availRoom = await this.chatroomModel.findChatroomByRoomId(chatroomId);
        res.status(200).send(JSON.stringify(availRoom));
    };

    findPrivateRoom = async (req, res) => {
        const userId1 = req.params.userId1;
        const userId2 = req.params.userId2;
        const userIds = [userId1,userId2]
        let availRoom = await this.chatroomModel.findChatroomByUserIds(userIds);
        res.status(200).send(JSON.stringify(availRoom));
    };

    findPublicRoom = async (req, res) => {
        const creater = req.query.creater;
        let availRoom = await this.chatroomModel.findChatroomByCreater(creater);
        res.status(200).send(JSON.stringify(availRoom));
    };

    generatePublicRoom = async (req, res) => {
        const creater = req.body.creater;
        let newChatroom = {
            id: uuid(),
            userIds:[],
            creater:creater
        }
        let newRoom = await this.chatroomModel.createChatroom(newChatroom);
        res.status(201).send(JSON.stringify(newRoom));
    };
}

let chatroomModel = ChatroomModel.getInstance(Chatroom);
let chatroomController = new ChatroomController(chatroomModel);
module.exports = Router;
