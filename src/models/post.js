var mongoose = require('mongoose');
var _ = require('underscore');

var PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    score: { type: Number, default: 0 },
    date: Date,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ],
    votes: [{user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, vote: Number}],
    reacts: {type: mongoose.Schema.Types.Mixed}
}, { versionKey: false, minimize: false });

var populate = function (next) {
    this.populate('author');
    this.populate('comments');
    //this.populate('reacts');
    // this.populate('votes');
    // calculate score every time a document is found or saved
    this.score = _.reduce(this.votes, function (memo, vote) {
        return memo + vote.vote
    }, 0);
    next();
};

PostSchema.pre('find', populate);
PostSchema.pre('findOne', populate);
PostSchema.pre('save', populate);

module.exports = mongoose.model('Post', PostSchema);