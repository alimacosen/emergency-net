const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const EmergencySupplyRequestModel = require("../models/emergencySupplyRequest.model.js");
const mongoose = require('mongoose');
const EmergencySupplyRequestSchema = require('../schema/emergencySupplyRequest.schema.js').EmergencySupplyRequestSchema;
const EmergencySupplyRequest = mongoose.model('emergencySupplyRequest', EmergencySupplyRequestSchema);
const getFilter = require('./searchQuery.helper.js').getFilter;

class EmergencySupplyRequestController {

    emergencySupplyRequestModel;

    constructor(emergencySupplyRequestModel){
        this.emergencySupplyRequestModel = emergencySupplyRequestModel;
        Router.get("/:requestId", jwttoken.authenticateToken, this.findRequest);
        Router.post("/", jwttoken.authenticateToken, this.postRequest);
        Router.put("/:requestId", jwttoken.authenticateToken, this.updateRequest);
    }


    postRequest = async(req, res) => {
        const requester = req.body.requester;
        const requesterId =  req.body.requesterId;
        const provider = req.body.provider;
        const providerId = req.body.providerId;
        const type = req.body.type;
        const quantity = req.body.quantity;
        const response = req.body.response;
        let newRequest = {
            id: uuid(),
            requester: requester,
            requesterId: requesterId,
            provider: provider,
            providerId: providerId,
            type: type,
            quantity: quantity,
            response: response,
            createDate: Date.now(),
        }
        let request = await this.emergencySupplyRequestModel.createEmergencySupplyRequest(newRequest);
        res.status(201).send(JSON.stringify(request));
    }

    findRequest = async (req, res) => {
        const requestId = req.params.requestId;
        let filter = {
            id: requestId,
        }
        let request = await this.emergencySupplyRequestModel.retrieveEmergencySupplyRequest(filter);
        res.status(200).send(JSON.stringify(request));
    };

    updateRequest = async (req, res) => {
        const filter = {
            id: req.body.id
        }
        const update = {
            response: req.body.response,
        }
        let request = await this.emergencySupplyRequestModel.updateEmergencySupplyRequest(filter,update);
        request.response = req.body.response;
        req.io.to(request.providerId).to(request.requesterId).emit('request update', JSON.stringify(request));
        res.status(200).send(JSON.stringify(request));
    };
}

let emergencySupplyRequestModel = new EmergencySupplyRequestModel(EmergencySupplyRequest);
let emergencySupplyRequestModelController = new EmergencySupplyRequestController(emergencySupplyRequestModel);
module.exports = Router;
