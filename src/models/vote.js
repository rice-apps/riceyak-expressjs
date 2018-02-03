var mongoose = require('mongoose');

var VoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vote: Number,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
}, { versionKey: false });

VoteSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret._id;
        return ret;
    }
});

VoteSchema.index({'post': 'hashed','user': 'hashed'});

module.exports = mongoose.model('Vote', VoteSchema);