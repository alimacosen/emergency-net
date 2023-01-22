const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require('express')
const Router = express.Router();
const EmergencySupplyModel = require("../models/emergencySupply.model.js");
const mongoose = require('mongoose');
const EmergencySupplySchema = require('../schema/emergencySupply.schema.js').EmergencySupplySchema;
const EmergencySupply = mongoose.model('emergencySupply', EmergencySupplySchema);
const getFilter = require('./searchQuery.helper.js').getFilter;

class EmergencySupplyController {

    emergencySupplyModel;

    constructor(emergencySupplyModel){
        this.emergencySupplyModel = emergencySupplyModel;
        Router.get("/", jwttoken.authenticateToken, this.findAllSupplies);
        Router.post("/", jwttoken.authenticateToken, this.postSupply);
        Router.put("/", jwttoken.authenticateToken, this.updateSupply);
        Router.put("/:type/:providerId", jwttoken.authenticateToken, this.updateSupplyByApproval);
        Router.delete("/", jwttoken.authenticateToken, this.deleteSupply);
    }


    postSupply = async(req, res) => {
        const provider = req.body.provider;
        const providerId = req.body.providerId;
        const type = req.body.type;
        const quantity = req.body.quantity;
    
        let newSupply = {
            id: uuid(),
            provider: provider,
            providerId: providerId,
            type: type,
            quantity: quantity,
            lastModifiedDate: Date.now(),
        }
        let supply = await this.emergencySupplyModel.createEmergencySupply(newSupply);
        req.io.emit('update emergencySupply directory', JSON.stringify(supply));
        res.status(201).send('user ' + provider + ' share a supply!');
    }

    findAllSupplies = async (req, res) => {
        const filter = getFilter(req.query);
        let emergencySupplies = await this.emergencySupplyModel.retrieveEmergencySupplies(filter);
        res.status(200).send(JSON.stringify(emergencySupplies));
    };


    updateSupply = async (req, res) => {
        const filter = {
            provider:req.body.provider,
            type: req.body.type,
        }
        const lastModifiedDate = Date.now();
        const update = {
            quantity: req.body.quantity,
            lastModifiedDate: lastModifiedDate,
        }
        let emergencySupplies = await this.emergencySupplyModel.updateEmergencySupply(filter,update);
        const filterAf = {
            provider:req.body.provider,
            providerId:emergencySupplies.providerId,
            type: req.body.type,
            quantity: req.body.quantity,
            lastModifiedDate: lastModifiedDate,
        }
        req.io.emit('update supply', JSON.stringify(filterAf));
        res.status(200).send(JSON.stringify(emergencySupplies));
    };

    updateSupplyByApproval = async (req, res) => {
        let filter = {
            provider:req.body.provider,
            providerId:req.body.providerId,
            type: req.body.type,
        }
        let emergencySupply = await this.emergencySupplyModel.retrieveOneEmergencySupply(filter);
        let updated_quantity = parseInt(emergencySupply.quantity,10) - parseInt(req.body.quantity,10)
        if (updated_quantity === 0){
            let emergencySupplies = await this.emergencySupplyModel.deleteEmergencySupply(filter);
            req.io.emit('delete supply', JSON.stringify(filter));
            res.status(200).send(JSON.stringify(emergencySupplies));
        }else{
            const lastModifiedDate = Date.now();
            const update = {
                quantity: updated_quantity,
                lastModifiedDate: lastModifiedDate,
            }
            let update_emergencySupply = await this.emergencySupplyModel.updateEmergencySupply(filter,update);
            const filterAf = {
                provider:req.body.provider,
                type: req.body.type,
                quantity: updated_quantity,
                lastModifiedDate: lastModifiedDate,
            }
            req.io.emit('update supply', JSON.stringify(filterAf));
            res.status(200).send(JSON.stringify(update_emergencySupply));
        }
    };

    deleteSupply = async (req, res) => {
        const filter = {
            provider: req.body.provider,
            type: req.body.type,
        }
        let emergencySupplies = await this.emergencySupplyModel.deleteEmergencySupply(filter);
        req.io.emit('delete supply', JSON.stringify(filter));
        res.status(200).send(JSON.stringify(emergencySupplies));
    };
}

let emergencySupplyModel = new EmergencySupplyModel(EmergencySupply);
let emergencySupplyModelController = new EmergencySupplyController(emergencySupplyModel);
module.exports = Router;
