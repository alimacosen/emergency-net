class EmergencySupplyRequestModel {
    mongoose;
  
    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    setStrategy(mongoose){
        this.mongoose = mongoose;
    }

    createEmergencySupplyRequest(emergencySupplyRequest) {
        return this.mongoose.create(emergencySupplyRequest);
    }

    retrieveEmergencySupplyRequest(filter) {
        return this.mongoose.findOne(filter).exec();
    }

    updateEmergencySupplyRequest(filter,update) {
        return this.mongoose.findOneAndUpdate(filter, update).exec();
    }


    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new EmergencySupplyRequestModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = EmergencySupplyRequestModel;
