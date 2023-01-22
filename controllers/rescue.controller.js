const response = require('./response.js');
const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const RescueModel = require("../models/rescue.model.js");
const mongoose = require('mongoose');
const RescueSchema = require('../schema/rescue.schema.js').RescueSchema;
const Rescue = mongoose.model('rescue', RescueSchema);
const performanceCheck = require("../middlewares/performance.check.js").performanceCheck;
const UserModel = require("../models/user.model.js");
const UserSchema = require('../schema/user.schema.js').UserSchema;
const User = mongoose.model('user', UserSchema);
const validator = require('../middlewares/validator.js'); 
const schema = require('../middlewares/validator.schemas/rescue.schema.js');
const logger = require("../loggers/logger");

class RescueController {

    rescueModel;
    userModel;

    constructor(rescueModel, userModel){
        this.rescueModel = rescueModel;
        this.userModel = userModel;
        Router.get("/", jwttoken.authenticateToken, performanceCheck, this.getAllRescues);
        Router.post("/", jwttoken.authenticateToken, performanceCheck, validator(schema.rescuePost), this.createOneRescue);
        Router.get("/:rescueId", jwttoken.authenticateToken, performanceCheck, this.getRescue);
        Router.patch("/:rescueId/status", jwttoken.authenticateToken, performanceCheck, validator(schema.updateRescueStatus), this.updateRescueStatus);
        Router.patch("/:rescueId/match", jwttoken.authenticateToken, performanceCheck, validator(schema.confirmRescue), this.confirmRescue);
        Router.patch("/:rescueId/location", jwttoken.authenticateToken, performanceCheck, validator(schema.updateRescuerLocation), this.updateRescuerLocation);
    }

    getAllRescues = async (req, res) => {
        let rescues = await rescueModel.getAllRescues();
        response.code = 200;
        response.err_msg = "";
        response.data = rescues;
        res.status(200).send(JSON.stringify(response));
    };

    getRescue = async (req, res) => {
        let rescueId = req.params.rescueId;
        let rescue = await rescueModel.getRescue(rescueId);
        response.code = 200;
        response.err_msg = "";
        response.data = {rescue};
        res.status(200).send(JSON.stringify(response));
    };

    createOneRescue = async (req, res) => {
        let rescueHasExisted = await this.rescueModel.rescueHasExisted(req.user.userId);
        if(rescueHasExisted){
            response.code = 409;
            response.err_msg = "The current user has an existing rescue request not completed.";
            response.data = {};
            res.status(409).send(JSON.stringify(response));
            return;
        }
        let userId = req.user.userId;
        let user = await this.userModel.findUserById(userId);
        let newRescue = {
            id: uuid(),
            citizenId: userId,
            citizenName: user.username,
            place: req.body.place,
            citizenLongitude: req.body.citizenLongitude,
            citizenLatitude: req.body.citizenLatitude,
            rescueStatus: 0,
            createDate: Date.now(),
            updateDate: Date.now()
        }
        let rescue = await rescueModel.createOneRescue(newRescue);
        req.io.emit('new rescue', JSON.stringify(rescue));
        response.code = 200;
        response.err_msg = "";
        response.data = {};
        res.status(200).send(JSON.stringify(response));
    };

    updateRescueStatus = async (req, res) => {
        let userId = req.user.userId;  
        let rescueId = req.params.rescueId;
        let rescueStatus = req.body.rescueStatus;
        let rescue = await rescueModel.updateRescueStatus(rescueId, null, rescueStatus);

        req.io.emit('rescue status change', JSON.stringify(rescue));
        response.code = 200;
        response.err_msg = "";
        response.data = {};
        res.status(200).send(JSON.stringify(response));
    }

    confirmRescue = async (req, res) => {
        let rescueId = req.params.rescueId;
        let rescue = await rescueModel.getRescueRequestById(rescueId);
        let rescuerId = req.user.userId;
        if(rescue.citizenId == rescuerId){
            response.code = 406;
            response.err_msg = "The citizen can't be the rescuer themself.";
            response.data = {};
            res.status(406).send(JSON.stringify(response));
            return;
        }

        let rescueStatus = req.body.rescueStatus;
        let returnRescue = await rescueModel.updateRescueStatus(rescueId, rescuerId, rescueStatus);
        req.io.emit('rescue status change', JSON.stringify(returnRescue));
        response.code = 200;
        response.err_msg = "";
        response.data = {returnRescue};
        res.status(200).send(JSON.stringify(response));
    }

    // when update, dont't await for the success.
    updateRescuerLocation = async (req, res) => {
        let rescueId = req.params.rescueId;
        let rescuerLongitude = req.body.rescuerLongitude;
        let rescuerLatitude = req.body.rescuerLatitude;

        let rescue = await rescueModel.updateRescuerLocation(rescueId, rescuerLongitude, rescuerLatitude);
        let rescuerLocation = {rescueId: rescueId, rescuerLongitude:rescuerLongitude, rescuerLatitude:rescuerLatitude};
        logger.info("emit to: " + 'LOCATIONUPDATE:' + rescueId);
        req.io.emit('LOCATIONUPDATE'+rescueId, JSON.stringify(rescuerLocation));

        response.code = 200;
        response.err_msg = "";
        response.data = {};
        res.status(200).send(JSON.stringify(response));
    }
}

let userModel = UserModel.getInstance(User);
let rescueModel = RescueModel.getInstance(Rescue);
let rescueController = new RescueController(rescueModel, userModel);
module.exports = Router;





