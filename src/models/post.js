var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
    title: String,
    body: String,
    score: {type: Number, default: 0},
    date: Date,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]}, { versionKey: false });

var populate = function (next) { this.populate('author'); next(); };

PostSchema.pre('find', populate);
PostSchema.pre('findOne', populate);
PostSchema.pre('save', populate);

module.exports = mongoose.model('Post', PostSchema);