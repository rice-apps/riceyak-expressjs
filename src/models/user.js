var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  avatar_url: String
}, { versionKey: false });

UserSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.username;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);