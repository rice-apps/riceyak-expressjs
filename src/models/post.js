var mongoose = require('mongoose');
var _ = require('underscore');
var Comment = require('./comment')
var config = require('../config');

var validReacts = {
  "angry": 0,
  "love": 0,
  "wow": 0,
  "funny": 0,
  "sad": 0
};

var PostSchema = new mongoose.Schema({
  _id: {type: String, index: true},
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
  votes: {type: mongoose.Schema.Types.Mixed},
  reacts: {type: mongoose.Schema.Types.Mixed},
  reactCounts: {type: mongoose.Schema.Types.Mixed},
  removed: {type: Boolean, default: false},
}, { versionKey: false, minimize: false,  usePushEach: true});

PostSchema.statics.toClient = function(userID, post) {
  return {
    _id: post._id,
    title: post.title,
    body: post.body,
    score: post.score,
    date: post.date,
    comments: Comment.toClientBatch(userID, post.comments),
    userVote: post.votes[userID] || 0,
    userReact: post.reacts[userID] || "none",
    reactCounts: post.reactCounts
  }
}

PostSchema.statics.toClientBatch = function(userID, posts) {
  return posts.map((p, idx) => PostSchema.statics.toClient(userID, p))
}

var populate = function (next) {
  this.populate('author');
  this.populate('comments');
  next();
};

PostSchema.pre('find', populate);
PostSchema.pre('findOne', populate);
PostSchema.pre('save', populate);

Posts = mongoose.model('Post', PostSchema, config.posts_collection)
module.exports = Posts
