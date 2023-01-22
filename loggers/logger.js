const {createLogger, transports} = require("winston");
const options = require("../config/winston");
const winston = require("winston");
require('winston-mongodb');


let logger = createLogger({
    transports: [
        new transports.File(options.info),
        new transports.File(options.error),
        new transports.File(options.warn),
    ]
});

if (process.env.NODE_ENV === "dev") {
    logger.add(new winston.transports.Console(options.console));
    logger.add(new winston.transports.MongoDB(options.db_local));
} else if (process.env.NODE_ENV === "prod") {
    logger.add(new winston.transports.MongoDB(options.db_prod));
}

module.exports = logger;
