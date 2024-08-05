const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendRequestSchema = new Schema({
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
});

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  bio: { type: String },
  profilePicture: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [friendRequestSchema]
});

module.exports = mongoose.model('User', userSchema);
