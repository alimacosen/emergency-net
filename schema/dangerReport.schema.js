const mongoose = require('mongoose');

DangerReportSchema = new mongoose.Schema({
    id: {type: String,},
    creater: {type: String,},
    title: {type: String,},
    zipcode: {type: String,},
    dangerItems: [{type: String,}],
    description: {type: String,},
    createDate: {type: Date,default: Date.now()}
}, {collection: 'dangerReport'})

exports.DangerReportSchema = DangerReportSchema;
