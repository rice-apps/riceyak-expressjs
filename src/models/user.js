var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    avatar_url: String,
    is_admin: Boolean
}, { versionKey: false });

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.username;
        return ret;
    }
});

module.exports = mongoose.model('User', UserSchema);