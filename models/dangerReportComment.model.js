class DangerReportCommentModel {
    mongoose = null;

    constructor(mongoose) {
        this.mongoose = mongoose;
        this.instance = null;
    }

    getDangerReportComments(reportId) {
        return this.mongoose.find({dangerReportId: reportId}).exec();
    }

    createDangerReportComment(comment) {
        return this.mongoose.create(comment);
    }

    static getInstance(mongoose) {
        if (!this.instance) {
            this.instance = new DangerReportCommentModel(mongoose);
        }
        return this.instance;
    }
}

module.exports = DangerReportCommentModel;