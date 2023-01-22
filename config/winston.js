const appRoot = require('app-root-path');
const { createLogger, format, transports } = require("winston");
const dbConfig = require('../config/db.config.js');

let formatHelper = () => {
    return format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf(
            (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
    );
}

let dbFormatHelper = () => {
    return format.combine(
        format.timestamp(),
        format.json());
}

let dbOption = (databaseConfig) => {
    return {
        level: 'error',
        db : databaseConfig,
        handleExceptions: true,
        options: {
            useUnifiedTopology: true
        },
        collection: 'server_error_logs',
        format: dbFormatHelper()
    }
}

let debugLogOption = () => {
    return {
        level: 'debug',
            handleExceptions: true,
        json: false,
        colorize: true,
        format: formatHelper()
    }
}

let logOption = (level) => {
    if (level === 'debug') {
        return debugLogOption();
    }
    return {
        level: level,
        filename: `${appRoot}/logs/server.${level}.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false,
        format: formatHelper(),
    }
}

const options = {
    error: logOption('error'),
    warn: logOption('warn'),
    info: logOption('info'),
    console: logOption('debug'),
    db_local: dbOption(dbConfig.local),
    db_prod: dbOption(dbConfig.prod)
};

module.exports = options;
