var mongoose = require('mongoose');
var _ = require('underscore');
//
var CommentSchema = new mongoose.Schema({
    _id: {type: String, index: true},
    post_id: {type: String},
    body: {
      type: String,
      maxlength: 200,
      required: true
    },
    score: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    votes: {type: mongoose.Schema.Types.Mixed},
}, { versionKey: false, minimize: false, usePushEach: true });

CommentSchema.statics.toClient = function(userID, comment) {
  
    return {
      _id: comment._id,
      body: comment.body,
      score: comment.score,
      date: comment.date,
      userVote: comment.votes[userID] || 0,
    }
  }
  
CommentSchema.statics.toClientBatch = function(userID, comments) {
    return comments.map((c, idx) => CommentSchema.statics.toClient(userID, c))
  }
  
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