const dbConfig = require('../config/db.config.js');

class RescueModel {
    mongoose;
  
    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    getAllRescues() {
        return this.mongoose.find().sort({updateDate: 1}).exec();
    }

    async getRescue(rescueId){
        return this.mongoose.findOne({id: rescueId});
    }

    createOneRescue(rescue) {
        return this.mongoose.create(rescue);
    }

    async rescueHasExisted(userId) {
        const rescue = await this.mongoose.findOne({ citizenId:userId, 
            $or: [
                { rescueStatus:0},
                { rescueStatus:1 } 
            ]
        });
        if(rescue){
            return true;
        }
        return false;
    }

    async getRescueRequestById(rescueId) {
        const rescue = await this.mongoose.findOne({ id: rescueId, rescueStatus: 0});
        return rescue;
    }

    async updateRescueStatus(rescueId, rescuerId, rescueStatus) {
        const filter = { id: rescueId };
        const update = { rescuerId:rescuerId, rescueStatus: rescueStatus, updateDate: Date() };
        let rescue = await this.mongoose.findOneAndUpdate(filter, update, {
            new: true
        });
        return rescue;
    }

    async confirmRescue(rescueId, rescueStatus) {
        const filter = { id: rescueId };
        const update = { rescueStatus: rescueStatus, updateDate: Date() };
        let rescue = await this.mongoose.findOneAndUpdate(filter, update, {
            new: true
        });
        return rescue;
    }

    async updateRescuerLocation(rescueId, rescuerLongitude, rescuerLatitude) {
        const filter = { id: rescueId };
        const update = { rescuerLongitude:rescuerLongitude, rescuerLatitude:rescuerLatitude};
        let rescue = await this.mongoose.findOneAndUpdate(filter, update);
        return rescue;
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new RescueModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = RescueModel;
