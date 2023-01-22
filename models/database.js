const dbConfig = require('../config/db.config.js');
const mongoose = require('mongoose');

class Database {
    normalConnection;
    testConnection;
    constructor(){
        let env = process.env.NODE_ENV;
        if(env == "prod"){
            mongoose.connect(dbConfig.prod);
            this.normalConnection = mongoose.connection;
            let testStr = dbConfig.prod.replace("ESN", "ESN-test");
            this.testConnection = mongoose.createConnection(testStr);
        }else if(env == "dev"){
            mongoose.connect(dbConfig.local);
            this.normalConnection = mongoose.connection;
            let testStr = dbConfig.local.replace("ESN", "ESN-test");
            this.testConnection = mongoose.createConnection(testStr);
        }
        this.instance = null;
    }

    getBindingConnection(modelName, schema){
        if(serverStatus == 1){
            return this.normalConnection.model(modelName, schema);
        }else{
            return this.testConnection.model(modelName, schema);
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Database();
        }
        return this.instance;
    }
}

module.exports = Database.getInstance();