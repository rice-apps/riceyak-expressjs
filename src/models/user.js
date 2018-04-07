var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    avatar_url: String,
    is_admin: Boolean
}, { versionKey: false });


module.exports = mongoose.model('User', UserSchema);