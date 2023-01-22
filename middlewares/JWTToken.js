const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const config = require('../config/config.js');
const logger = require("../loggers/logger");

exports.generateAccessToken = (param) => {
    return jwt.sign({userId:param}, config.TOKEN_SECRET, {expiresIn: '86400s'});
}

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
 
    if(token == null){
      return res.sendStatus(401);
    }
 
    jwt.verify(token, config.TOKEN_SECRET, (err, user) => {
        if(err) {
            logger.error(JSON.stringify(err));
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })
}
