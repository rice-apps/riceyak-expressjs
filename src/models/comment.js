var mongoose = require('mongoose');
//
var CommentSchema = new mongoose.Schema({
    body: String,
    score: {type: Number, default: 0},
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// exclude the author field - riceyak is anonymous!
CommentSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.author;
        return ret;
    }
});

module.exports = mongoose.model('Comment', CommentSchema);