const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const UserModel = require("../models/user.model.js");
const mongoose = require('mongoose');
const UserSchema = require('../schema/user.schema.js').UserSchema;
const User = mongoose.model('user', UserSchema);
const UserStatusModel = require("../models/userStatus.model.js");
const UserStatusSchema = require('../schema/userStatus.schema.js').UserStatusSchema;
const UserStatus = mongoose.model('userStatus', UserStatusSchema);
const Response = require('./response.js');
const getFilter = require('./searchQuery.helper.js').getFilter;
const nodemailer = require('nodemailer');
const validator = require('../middlewares/validator.js'); 
const schema = require('../middlewares/validator.schemas/user.schema.js');
const logger = require("../loggers/logger");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: "fse.s22.esn.b1@gmail.com",
        pass: "1q2w3e4r!@#$azsxdcfv"
    }
})

class UserController {

    userModel;
    userStatusModel;

    constructor(userModel, userStatusModel){
        this.userModel = userModel;
        this.userStatusModel = userStatusModel;
        Router.get("/alluser", jwttoken.authenticateToken, this.getAllUsers);
        Router.get("/bannedusers", jwttoken.authenticateToken, this.getBannedUser);
        Router.get("/:userId", jwttoken.authenticateToken, this.getUser);
        Router.get("/", jwttoken.authenticateToken, this.getUsers);
        Router.post("/ack", jwttoken.authenticateToken, validator(schema.setAck), this.setAck);
        Router.post("/actstatus", jwttoken.authenticateToken, validator(schema.setActStatus),  this.setActStatus);
        Router.post("/userstatus", jwttoken.authenticateToken, validator(schema.setCurrentStatus), this.setCurrentStatus);
        Router.patch("/:userId/zipcode", jwttoken.authenticateToken, validator(schema.setZipcodeLocation), this.setZipcodeLocation);
        Router.post("/useremail", jwttoken.authenticateToken, this.setUserEmail);
        Router.post("/removeContact", jwttoken.authenticateToken, this.removeContact);
        Router.post("/ECrequest", jwttoken.authenticateToken, this.requestContact);
        Router.post("/ECrespond", jwttoken.authenticateToken, this.respondContact);
        Router.post("/email", jwttoken.authenticateToken, this.sendUserEmail);
    }

    getUser = async (req, res) => {
        let userId = req.params.userId;

        let user = await this.userModel.findUserById(userId);
        res.status(200).send(JSON.stringify(user));
    };

    getBannedUser = async (req, res) => {
        let filter = {
            accountStatus: false
        }
        let users = await this.userModel.findBannedUsers(filter);
        res.status(200).send(JSON.stringify(users));
    };

    getUsers = async (req, res) => {
        const filter = getFilter(req.query);
        let users = await this.userModel.findUserWithStatus(filter);
    
        Response.code = "200";
        Response.data = users;
    
        res.send(JSON.stringify(Response));
    };

    getAllUsers = async (req, res) => {
        let users = await this.userModel.findAllUsers();

        Response.code = "400";
        Response.data = users;
    
        res.send(JSON.stringify(Response));
    }

    setAck = async (req, res) => {
        const userId = req.user.userId;
        const ackStatus = req.body.ackStatement;

        let userInfo = await this.userModel.setUserAck(userId, ackStatus);

        res.status(200).send(JSON.stringify(userInfo));
    };

    setActStatus = async (req, res) => {
        const userId = req.user.userId;
        const activeStatus = req.body.activeStatus;

        let userInfo = await this.userModel.setUserActStatus(userId, activeStatus);

        res.status(200).send(JSON.stringify(userInfo));
    };
    
    setCurrentStatus = async (req, res) => {
        const userId = req.user.userId;
        const userStatus = req.body.userStatus;

        let userInfo = await this.userModel.setUserCurrentStatus(userId, userStatus);
        let user = await this.userModel.findUserById(userId);

        let newUserStatus = {
            id: uuid(),
            userId: userId,
            userStatus: userStatus,
            timestamp: new Date()
        }
        await this.userStatusModel.addUserStatus(newUserStatus);

        res.status(200).send(JSON.stringify(userInfo));
        req.io.emit('status change', JSON.stringify({userStatus: user.userStatus, userInfo:user, msg:"current status changed."}));
    };

    setZipcodeLocation = async (req, res) => {
        const userId = req.params.userId;
        const zipcode = req.body.zipcode;

        await this.userModel.setUserZipcodeLocation(userId, zipcode);
        res.status(200).send(`set user: ${userId} zipcode to ${zipcode}`);
    }

    setUserEmail = async (req, res) => {
        const userId = req.user.userId;
        const userEmail = req.body.email;

        let userInfo = await this.userModel.updateEmail(userId, userEmail);

        res.status(200).send(JSON.stringify(userInfo));
    }

    removeContact = async (req, res) => {
        const userId = req.user.userId;
        const userName = req.body.username;

        let userInfo = await this.userModel.removeContact(userId, userName);

        res.status(200).send(JSON.stringify(userInfo));
    }

    requestContact = async(req, res) => {
        const senderId = req.user.userId;
        const receiverId = req.body.receiverId;
        const receiverName = req.body.receiverName;
        const senderName = req.body.senderName;

        let newRequest = {
            senderId: senderId,
            senderName: senderName,
            receiverId: receiverId,
            receiverName: receiverName
        }
        let userInfo = await this.userModel.addReceiverRequest(receiverId, newRequest);
        userInfo = await this.userModel.addPendingEC(senderId, receiverName);

        req.io.to(receiverId).emit('emergency contact request', JSON.stringify({senderId: senderId, senderName: senderName, msg:"emergency contact request send"}));
        res.status(200).send(JSON.stringify(userInfo));
    }

    respondContact = async(req, res) => {
        const receiverId = req.user.userId;
        const senderId = req.body.senderId;
        const response = req.body.response;
        const receiverName = req.body.receiverName;

        let userInfo = await this.userModel.responseContact(senderId, receiverId);
        if (response === "true"){
            userInfo = await this.userModel.addContact(senderId, receiverName, receiverId);
        }
        else{
            userInfo = await this.userModel.removePendingEC(senderId, receiverName);
        }

        req.io.to(senderId).emit('emergency contact response', JSON.stringify({receiverId: receiverId, receiverName: receiverName, response: response, msg:"emergency contact response send"}));
        
        res.status(200).send(JSON.stringify(userInfo));
    }

    sendUserEmail = async(req, res)=>{
        const privateRoomId = req.body.privateRoomId;
        const content = req.body.content;
        const email = req.body.userEmail;

        // send email
        const option = {
            from: "fse.s22.esn.b1@gmail.com",
            to: email,
            subject: "ESN Message From Your Emergency Contact",
            text: content + "\nGo to http://fse-s22-esn-b1.herokuapp.com/private?id=" + privateRoomId + " and contact!"
        }
        let result = true;
        transporter.sendMail(option, function(err, info){
            if (err){
                logger.error(JSON.stringify(err));
                result = false
                return;
            }
            logger.info(info.response);
        })
        
        if (!result){
            res.status(500).send(JSON.stringify(result));
        }
        res.status(200).send(JSON.stringify(result));
    }
}

let userModel = UserModel.getInstance(User);
let userStatusModel = UserStatusModel.getInstance(UserStatus);
let userController = new UserController(userModel, userStatusModel);
module.exports = Router;
