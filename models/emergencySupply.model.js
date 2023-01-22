class EmergencySupplyModel {
    mongoose;
  
    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    setStrategy(mongoose){
        this.mongoose = mongoose;
    }

    createEmergencySupply(emergencySupply) {
        return this.mongoose.create(emergencySupply);
    }

    retrieveEmergencySupplies(filter) {
        return this.mongoose.find(filter).sort({lastModifiedDate: -1}).limit(100).exec();
    }

    retrieveOneEmergencySupply(filter) {
        return this.mongoose.findOne(filter).exec();
    }

    updateEmergencySupply(filter,update) {
        return this.mongoose.findOneAndUpdate(filter, update);
    }

    deleteEmergencySupply(filter) {
        return this.mongoose.deleteOne(filter);
    }


    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new EmergencySupplyModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = EmergencySupplyModel;
