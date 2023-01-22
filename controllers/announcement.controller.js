const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const AnnouncementModel = require("../models/announcement.model.js");
const mongoose = require('mongoose');
const AnnouncementSchema = require('../schema/announcement.schema.js').AnnouncementSchema;
const Announcement = mongoose.model('announcement', AnnouncementSchema);
const getFilter = require('./searchQuery.helper.js').getFilter;

class AnnouncementController {

    announcementModel;

    constructor(announcementModel){
        this.announcementModel = announcementModel;
        Router.get("/", jwttoken.authenticateToken, this.findAllAnnouncements);
        Router.post("/", jwttoken.authenticateToken, this.postAnnouncement);
    }


    postAnnouncement= async(req, res) => {
        const sender = req.body.sender;
        const senderId = req.body.senderId;
        const content = req.body.content;
        const status = req.body.status;
    
        let newAnnouncement = {
            id: uuid(),
            sender: sender,
            senderId: senderId,
            content: content,
            createDate: Date.now(),
            senderStatus: status
        }
        let announcement = await this.announcementModel.createAnnouncement(newAnnouncement);
        req.io.emit('public announcement', JSON.stringify(announcement));
        req.io.emit('latest announcement', JSON.stringify(announcement));
        res.status(201).send('user ' + sender + ' post a new announcement in room!');
    }

    findAllAnnouncements = async (req, res) => {
        const filter = getFilter(req.query);
        let latestAnnouncements = await this.announcementModel.retrieveAnnouncements(filter);
        res.status(200).send(JSON.stringify(latestAnnouncements));
    };
}

let announcementModel = new AnnouncementModel(Announcement);
let announcementController = new AnnouncementController(announcementModel);
module.exports = Router;
