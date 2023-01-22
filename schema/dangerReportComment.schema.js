const mongoose = require('mongoose');

DangerReportCommentSchema = new mongoose.Schema({
    id: {type: String,},
    dangerReportId: {type: String,},
    userId: {type: String,},
    username: {type: String,},
    content: {type: String,},
    createDate: {type: Date, default: Date.now()}
}, {collection: 'dangerReportComment'})

exports.DangerReportCommentSchema = DangerReportCommentSchema;
