var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    avatar_url: String
});

UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        delete ret.username;
        return ret;
    }
});

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');