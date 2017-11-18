var mongoose = require('mongoose');

var VoteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vote: Boolean
}, { versionKey: false });

VoteSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret._id;
        return ret;
    }
});

module.exports = mongoose.model('Vote', VoteSchema);