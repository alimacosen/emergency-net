const express = require("express");
const Router = express.Router();
const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken");
const mongoose = require("mongoose");
const {DangerReportSchema} = require("../schema/dangerReport.schema");
const {DangerReportCommentSchema} = require("../schema/dangerReportComment.schema");
const {UserSchema} = require("../schema/user.schema");
const DangerReport = mongoose.model('dangerReport', DangerReportSchema);
const DangerReportComment = mongoose.model('dangerReportComment', DangerReportCommentSchema);
const User = mongoose.model('user', UserSchema);
const DangerReportModel = require("../models/dangerReport.model.js");
const DangerReportCommentModel = require("../models/dangerReportComment.model.js");
const UserModel = require("../models/user.model.js");

class DangerReportController {

    dangerReportModel;
    dangerReportCommentModel;
    userModel;

    constructor(dangerReportModel, dangerReportCommentModel, userModel) {
        this.dangerReportModel = dangerReportModel;
        this.dangerReportCommentModel = dangerReportCommentModel;
        this.userModel = userModel;

        Router.get("/", jwttoken.authenticateToken, this.getDangerReports);
        Router.post("/", jwttoken.authenticateToken, this.postDangerReport);
        Router.patch("/:reportId", jwttoken.authenticateToken, this.updateDangerReport);
        Router.delete("/:reportId", jwttoken.authenticateToken, this.deleteDangerReport);
        Router.get("/:reportId/comments", jwttoken.authenticateToken, this.getDangerReportComments);
        Router.post("/:reportId/comments", jwttoken.authenticateToken, this.postDangerReportComment);
    }

    getDangerReports = async (req, res) => {
        const reports = await this.dangerReportModel.getDangerReports();
        res.status(200).send(JSON.stringify(reports));
    }

    postDangerReport = async (req, res) => {
        let newDangerReport = {
            id: uuid(),
            creater: req.user.userId,
            title: req.body.title,
            zipcode: req.body.zipcode,
            dangerItems: req.body.dangerItems,
            description: req.body.description,
            createDate: Date.now()
        }

        await this.dangerReportModel.createDangerReport(newDangerReport);
        await this.notifyNearbyUsers(req, newDangerReport);
        req.io.emit('new report', JSON.stringify(newDangerReport));
        res.status(201).send("new danger report has been created");
    }

    notifyNearbyUsers = async (req, newDangerReport) => {
        let allNearbyUsers = await this.userModel.findUserByZipcode(newDangerReport.zipcode);
        allNearbyUsers.forEach(function (user) {
            req.io.to(user.userId).emit('nearby danger', JSON.stringify(newDangerReport));
        });
    }

    updateDangerReport = async (req, res) => {
        let reportId = req.params.reportId;
        let updatedFields = req.body.updatedFields;

        await this.dangerReportModel.updateDangerReport(reportId, updatedFields);
        req.io.emit('update report', JSON.stringify({reportId: reportId, updatedFields}));
        res.status(200).send(`danger report ${reportId} has been updated`);
    }

    deleteDangerReport = async (req, res) => {
        let reportId = req.params.reportId;

        await this.dangerReportModel.deleteDangerReport(reportId);
        req.io.emit('delete report', JSON.stringify({reportId: reportId}));
        res.status(200).send(`danger report ${reportId} has been deleted`);
    }

    getDangerReportComments = async (req, res) => {
        let reportId = req.params.reportId;

        let comments = await this.dangerReportCommentModel.getDangerReportComments(reportId);
        res.status(200).send(JSON.stringify(comments));
    }

    postDangerReportComment = async (req, res) => {
        let newComment = {
            id: uuid(),
            dangerReportId: req.params.reportId,
            userId: req.user.userId,
            username: req.body.username,
            content: req.body.content,
            createDate: Date.now()
        }

        await this.dangerReportCommentModel.createDangerReportComment(newComment);
        req.io.emit('new report comment', JSON.stringify(newComment));
        res.status(201).send("new danger report comment has been created");
    }
}

let dangerReportModel = DangerReportModel.getInstance(DangerReport);
let dangerReportCommentModel = DangerReportCommentModel.getInstance(DangerReportComment);
let userModel = UserModel.getInstance(User);
let dangerReportController = new DangerReportController(dangerReportModel, dangerReportCommentModel, userModel);
module.exports = Router;