const dbModel = require("./models/database.js");
const app = require("./app.js");
const logger = require("./loggers/logger")

app.listen(process.env.PORT || 8000, () => {
    logger.info('Starting server');
});

