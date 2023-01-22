const dbConfig = require('../config/db.config.js');

class PerformanceModel {
    mongoose;
  
    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    getServerStatus() {
        let status = serverStatus;
        return status
    }

    startTest(userId) {
        if (serverStatus === 1) {
            global.serverStatus = 2;
            global.administrater = userId;
        }
        return serverStatus;
    }

    stopTest() {
        if (serverStatus === 2) {
            global.serverStatus = 1;
            global.administrater = "";
        }
        return serverStatus;
    }
    
    getRecords() {
        return this.mongoose.find().sort({createDate: 1}).exec();
    }
    
    saveRecords(records) {
        return this.mongoose.create(records);
    }
    
    cleanCollection(collectionNames) {
        return;
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new PerformanceModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = PerformanceModel;
