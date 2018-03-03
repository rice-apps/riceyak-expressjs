var mongoose = require('mongoose');
var _ = require('underscore');
//
var CommentSchema = new mongoose.Schema({
    body: String,
    score: {type: Number, default: 0},
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    votes: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, vote: Number}]
}, { versionKey: false });

var populate = function (next) {
    this.populate('author');
    // calculate score every time a document is found or saved
    this.score = _.reduce(this.votes, function (memo, vote) {
        return memo + vote.vote
    }, 0);
    next();
};

CommentSchema.pre('find', populate);
CommentSchema.pre('findOne', populate);
CommentSchema.pre('save', populate);
module.exports = mongoose.model('Comment', CommentSchema);