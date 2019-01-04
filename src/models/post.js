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
  votes: [{user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, vote: Number}],
  reacts: {type: mongoose.Schema.Types.Mixed},
  reactCounts: {type: mongoose.Schema.Types.Mixed},
  removed: {type: Boolean, default: false},
}, { versionKey: false, minimize: false,  usePushEach: true});

PostSchema.statics.toClient = function(userID, post) {
  userVote = 0
  for (var i = 0; i < post.votes.length; i++) {
    if (post.votes[i].user == user) {
        userVote = votes[i].vote
    }
  }

  return {
    _id: post._id,
    title: post.title,
    body: post.body,
    score: post.score,
    data: post.date,
    comments: post.comments,
    userVote: userVote,
    userReact: post.reacts[userID],
    reactCounts: post.reactCounts
  }
}

PostSchema.statics.toClientBatch = function(userID, posts) {
  return posts.map((p, idx) => PostSchema.statics.toClient(userID, p))
}

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

Posts = mongoose.model('Post', PostSchema, "noush_posts")
module.exports = Posts