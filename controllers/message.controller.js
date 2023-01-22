const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const MessageModel = require("../models/message.model.js");
const mongoose = require('mongoose');
const MessageSchema = require('../schema/message.schema.js').MessageSchema;
const Message = mongoose.model('message', MessageSchema);
const performanceCheck = require("../middlewares/performance.check.js").performanceCheck;
const getFilter = require('./searchQuery.helper.js').getFilter;
const database = require('../models/database.js');

class MessageController {

    messageModel;

    constructor(messageModel){
        this.messageModel = messageModel;
        Router.get("/:roomId", jwttoken.authenticateToken, performanceCheck, this.findAllByRoom);
        Router.post("/:roomId", jwttoken.authenticateToken, performanceCheck, this.sendMessageByRoom);
        Router.get("/private/unread/:userId", jwttoken.authenticateToken, performanceCheck, this.findUnread);
        //TODO: change to get /:roomId/latest
        Router.get("/public/latest", jwttoken.authenticateToken, performanceCheck, this.latestMessages);
        //TODO: put /:roomId/update
        Router.put("/unread/update", jwttoken.authenticateToken, performanceCheck, this.updateUnread);
        Router.put("/response/:requestId", jwttoken.authenticateToken, performanceCheck, this.updateRequestResponse);
    }

    sendMessageByRoom = async(req, res) => {
        const roomId = req.params.roomId;
        const username = req.body.name;
        const senderId = req.body.senderId;
        const receiver = req.body.receiver;
        const receiverId = req.body.receiverId;
    
        let newMessage = {
            id: uuid(),
            chatRoomId: roomId,
            sender: username,
            senderId: senderId,
            receiver: receiver,
            receiverId: receiverId,
            readOrNot: req.body.readOrNot,
            requestId: req.body.requestId,
            content: req.body.content,
            createDate: Date.now(),
            senderStatus: req.body.status
        }
        messageModel.setStrategy(database.getBindingConnection('message', MessageSchema));
        let message = await this.messageModel.createMessage(newMessage);
        if(receiver==="ALL"){
            req.io.emit('chat message', JSON.stringify(message));
        }else{
            req.io.to(senderId).to(receiverId).emit('private message', JSON.stringify(message));
        }
        res.status(201).send('user ' + username + ' post a new message in room: ' + roomId);
    }

    findAllByRoom = async(req, res) => {
        const filter = getFilter(req.query);
        const roomId = req.params.roomId;
        messageModel.setStrategy(database.getBindingConnection('message', MessageSchema));
        let historyMessages = await this.messageModel.readMessages(roomId, filter);
        res.status(200).send(JSON.stringify(historyMessages));
    };

    findUnread = async (req, res) => {
        const receiverId = req.params.userId;
        let unreadMessages = await this.messageModel.checkUnreadMessages(receiverId);
    
        res.status(200).send(JSON.stringify(unreadMessages));
    };

    updateUnread = async (req, res) => {
        const receiver = req.body.receiver;
        const roomId = req.body.roomId;
        let conditions = { 
            chatRoomId: roomId,
            receiver: receiver
        }
        let updatedMessages = await this.messageModel.updateUnreadMessages(conditions);
    
        res.status(200).send(JSON.stringify(updatedMessages));
    };

    updateRequestResponse = async (req, res) => {
        let filter = { 
            requestId: req.params.requestId,
        }
        let update = {
            requestResponse: req.body.response
        }
        let updatedMessage = await this.messageModel.updateResponse(filter, update);
    
        res.status(200).send(JSON.stringify(updatedMessage));
    };

    latestMessages = async (req, res) => {
        const sender = req.query.sender;
        const receiver = req.query.receiver;
        let conditons = { 
            sender: sender,
            receiver: receiver
        }
        let latestMessages = await this.messageModel.findlatestMessages(conditons);
    
        res.status(200).send(JSON.stringify(latestMessages));
    };
}

let messageModel = MessageModel.getInstance(Message);
let messageController = new MessageController(messageModel);
module.exports = Router;
