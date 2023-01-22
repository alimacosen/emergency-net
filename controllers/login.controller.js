const { v4: uuid } = require('uuid');
const jwttoken = require("../middlewares/JWTToken.js");
const express = require("express");
const Router = express.Router();
const UserModel = require("../models/user.model.js");
const mongoose = require('mongoose');
const UserSchema = require('../schema/user.schema.js').UserSchema;
const User = mongoose.model('user', UserSchema);
const Config = require('../config/config.js');
const validator = require('../middlewares/validator.js'); 
const schema = require('../middlewares/validator.schemas/login.schema.js'); 
const saltRounds = 10;
const bcrypt = require('bcryptjs');

class LoginController {

    userModel;

    constructor(userModel){
        this.userModel = userModel;
        Router.post("/login", validator(schema.login), this.login);
        Router.post("/registration", validator(schema.resgistration), this.register);
        Router.post("/update", jwttoken.authenticateToken, this.update);
        Router.delete("/logout", jwttoken.authenticateToken, this.logout);
    }

    login = async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        let {user, exists} = await this.userModel.login(username, password);
        // username and password not exist in database
        if (user == null) {
            res.status(500).send({
                message: "Username or password not exists."
            });
            return;
        }

        if (user === "banned"){
            res.status(403).send({
                message: "Username banned."
            });
            return
        }
        // username exist in database
        if (exists === false) {
            res.status(600).send({
                message: "Username exist."
            });
            return;
        }

        let ok = await this.userModel.setUserActStatus(user.userId, true);
        res.send(JSON.stringify({token:user.token, userId: user.userId, ackStatement: user.ackStatement, userRole: user.userRole}));
        req.io.emit('on off change', JSON.stringify({status:Config.ONLINE, userInfo:user, msg:"user has logged in."}));
    };

    register = async (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        let newUser = {
            userId: uuid(),
            username: username,
            password: password,
            createDate: new Date(),
            ackStatement: false,
            activeStatus: false,
            userStatus: 'Undefined',
            userRole: 'Citizen'
        }
    
        await this.userModel.addUser(newUser);
        
        let {user, exist} = await this.userModel.login(username, password);
    
        let ok = await this.userModel.setUserActStatus(user.userId, true);
        res.send(JSON.stringify({token:user.token, userId: user.userId, ackStatement: user.ackStatement}));
        // return user's all information
        req.io.emit('new user in', JSON.stringify({status:Config.ONLINE, userInfo:user, msg:"new user has logged in."}));
    };

    logout = async (req, res) => {
        let userId = req.user.userId; 
        let user = await this.userModel.findUserById(userId);
        let ok = await this.userModel.setUserActStatus(userId, false);
        
        res.status(200).send('User logged out.');
        req.io.emit('on off change', JSON.stringify({status:Config.OFFLINE, userInfo:user, msg:"user has logged out."}));
    }

    update = async (req, res) => {
        let userId = req.body.userId; 
        let username = req.body.username;
        let password = req.body.password;
        let userRole = req.body.role;
        let userAccountStatus = req.body.status;
        let update = {}
        if (password === "unchange"){
            update = {
                username:username,
                userRole:userRole,
                accountStatus:userAccountStatus
            }
        }else{
            password = await bcrypt.hash(password, saltRounds);
            update = {
                username:username,
                password:password,
                userRole:userRole,
                accountStatus:userAccountStatus
            }
        }

        let ok = await this.userModel.updateUser(userId, update);
        if (!ok) {
            res.status(500).send({
                message: "Invalid update infor",
            });
            return;
        }
        if (userAccountStatus==="false"){
            req.io.to(userId).emit("enforced-logout")
        }
        let user = await this.userModel.findUserById(userId);     
        res.send(JSON.stringify({user: user}));
    }
}

let userModel = UserModel.getInstance(User);
let loginController = new LoginController(userModel);
module.exports = Router;