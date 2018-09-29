var mongoose = require('mongoose');
var _ = require('underscore');

var validReacts = {
  "angry": 0,
  "love": 0,
  "wow": 0,
  "funny": 0,
  "sad": 0
};

var PostSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 200,
    required: true
  },
  body: {
    type: String,
    maxlength: 1000
  },
  score: {type: Number, default: 0},
  date: Date,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  votes: [{user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, vote: Number}],
  reacts: {type: mongoose.Schema.Types.Mixed},
  reactCounts: {type: mongoose.Schema.Types.Mixed},
  removed: {type: Boolean, default: false}
}, { versionKey: false, minimize: false,  usePushEach: true});


var populate = function (next) {
  this.populate('author');
  this.populate('comments');
  this.populate('votes');
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