const response = require("./response.js");
const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const PerformanceModel = require("../models/performance.model.js");
const mongoose = require('mongoose');
const PerformanceSchema = require('../schema/performance.schema.js').PerformanceSchema;
const Performance = mongoose.model('performance', PerformanceSchema);
const performanceCheck = require("../middlewares/performance.check.js").performanceCheck;

class PerformanceController {

    performanceModel;

    constructor(performanceModel){
        this.performanceModel = performanceModel;
        Router.get("/status/", jwttoken.authenticateToken, performanceCheck, this.getServerStatus);
        Router.post("/status/", jwttoken.authenticateToken, performanceCheck, this.startTest);
        Router.delete("/status/", jwttoken.authenticateToken, performanceCheck, this.stopTest);
        Router.get("/records/", jwttoken.authenticateToken, performanceCheck, this.getRecords);
        Router.post("/records/",jwttoken.authenticateToken, performanceCheck, this.saveRecords);
        Router.delete("/db/", jwttoken.authenticateToken, performanceCheck, this.cleanCollection);
    }

    getServerStatus = async (req, res) => {
        let status = performanceModel.getServerStatus();
        response.data = {status: status};
        res.status(200).send(response);
    };

     // set server mode to 2 and change target database, and return the latest server mode
    startTest = (req, res) => {
        let status = performanceModel.startTest(req.user.userId);
        response.data.status = status;
        res.status(200).send(response);
    };

    // set server mode to 1 and change target database, and return the latest server mode
    stopTest = (req, res) => {
        let status = performanceModel.stopTest();
        // weird bug, response.data is undefine
        // response.data.status = status;
        res.status(200).send(JSON.stringify(status));
    };

    // fetch  and return all the history performance test records
    getRecords = (req, res) => {
        let records = performanceModel.getRecords();
        response.data.records = records;
        res.status(200).send(response);
    };

    // save records passed in
    saveRecords = async (req, res) => {
        const records = req.body;
        const userId = req.user.userId;
        let newRecord = {
            id: uuid(),
            postNumPerSec: records.postNumPerSec,
            getNumPerSec: records.getNumPerSec,
            duration: records.duration,
            interval: records.interval,
            conductor: userId,
            createDate: Date.now()
        }
        response.data = await performanceModel.saveRecords(newRecord);
        res.status(201).send(response);
    };

    cleanCollection = async (req, res) => {
        const collectionName = "message";
        response.data = await performanceModel.cleanCollection(collectionName);
        res.status(201).send(response);
    };

    sendMessage = async(req, res) => {
        const username = req.body.name;
        const content = req.body.content;
        const status = req.body.status;
    
        let newMessage = {
            id: uuid(),
            sender: username,
            content: content,
            createDate: Date.now(),
            senderStatus: status
        }
        let message = await this.messageModel.createMessage(newMessage);
        req.io.emit('chat message', JSON.stringify(message));
        res.status(201).send('user post a new message');
    }

    findAll = async(req, res) => {
        let historyMessages = await this.messageModel.readMessages();
        res.status(200).send(JSON.stringify(historyMessages));
    }
}
let performanceModel = PerformanceModel.getInstance(Performance);
let performanceController = new PerformanceController(performanceModel);
module.exports = Router;





