var mongoose = require('mongoose');
//
var ReportSchema = new mongoose.Schema({
    reason: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewed: {type: Boolean, default: false}
}, { versionKey: false });

var populate = function (next) {
    this.populate('author');
    this.populate('post');

  next();
};

ReportSchema.pre('find', populate);
ReportSchema.pre('findOne', populate);

module.exports = mongoose.model('Report', ReportSchema);