var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    score: Number,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Comment', CommentSchema);