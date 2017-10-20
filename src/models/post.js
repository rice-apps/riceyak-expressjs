var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    score: {type: Number, default: 0},
    date: Date,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

// exclude the author field - riceyak is anonymous!
PostSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.author;
        return ret;
    }
});

module.exports = mongoose.model('Post', PostSchema);