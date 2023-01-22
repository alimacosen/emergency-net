class AnnouncementModel {
    mongoose;
  
    constructor(mongoose){
        this.mongoose = mongoose;
        this.instance = null;
    }

    setStrategy(mongoose){
        this.mongoose = mongoose;
    }

    createAnnouncement(announcement) {
        return this.mongoose.create(announcement);
    }

    retrieveAnnouncements(filter) {
        return this.mongoose.find(filter).sort({createDate: -1}).limit(50).exec();
    }

    latestAnnouncement(){
        return this.mongoose.find().sort({createDate: -1}).limit(1).exec();
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new AnnouncementModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = AnnouncementModel;
