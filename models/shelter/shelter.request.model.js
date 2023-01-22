class ShelterRequestModel {
    mongoose;

    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    createRequest(request) {
        return this.mongoose.create(request);
    }

    deleteRequest(requestID) {
        return this.mongoose.findOneAndDelete({ requestID: requestID});
    }

    updateRequest(requestID, newRequestField) {
        return this.mongoose.findOneAndUpdate({requestID: requestID}, newRequestField);
    }


    findRequests(filter) {
        return this.mongoose.find(filter).sort({createDate: -1}).exec();
    }


    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new ShelterRequestModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = ShelterRequestModel;
