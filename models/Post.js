const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [commentSchema]
});

module.exports = mongoose.model('Post', postSchema);
