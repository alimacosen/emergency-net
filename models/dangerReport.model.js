class DangerReportModel {
    mongoose = null;

    constructor(mongoose) {
        this.mongoose = mongoose;
        this.instance = null;
    }

    getDangerReports() {
        return this.mongoose.find().sort({createDate: 1}).exec();
    }

    createDangerReport(report) {
        return this.mongoose.create(report);
    }

    updateDangerReport(reportId, updatedFields) {
        return this.mongoose.findOneAndUpdate({id: reportId}, {$set: updatedFields}).exec();
    }

    deleteDangerReport(reportId) {
        return this.mongoose.findOneAndRemove({id: reportId}).exec();
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new DangerReportModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = DangerReportModel;