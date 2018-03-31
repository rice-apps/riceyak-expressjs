var mongoose = require('mongoose');
//
var CommentSchema = new mongoose.Schema({
    body: {
      type: String,
      maxlength: 200,
      required: true
    },
    score: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date
}, { versionKey: false });

var populate = function (next) {
    this.populate('author');
    next();
};

CommentSchema.pre('find', populate);
CommentSchema.pre('findOne', populate);

module.exports = mongoose.model('Comment', CommentSchema);