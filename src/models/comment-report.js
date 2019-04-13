var mongoose = require('mongoose');
//
var CommentReportSchema = new mongoose.Schema({
    type: String, 
    reason: String,
    postid: String, 
}, { versionKey: false});

// var populate = function (next) {
//     this.populate('author');
//     this.populate('post');

//   next();
// };

// ReportSchema.pre('find', populate);
// ReportSchema.pre('findOne', populate);

module.exports = mongoose.model('CommentReport', CommentReportSchema, 'comment_reports');
