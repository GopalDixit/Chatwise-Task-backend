const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/users');
const Post = require('./models/Post');
const connectDB = require('./Database/db');

const app = express();
app.use(bodyParser.json());

connectDB();

// Register user
app.post('/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, fullName });
  await user.save();

  res.status(201).send(user);
});

// Send friend request
app.post('/friend-request', async (req, res) => {
  const { fromUserId, toUserId } = req.body;

  const user = await User.findById(toUserId);
  user.friendRequests.push({ fromUser: fromUserId });
  await user.save();

  res.status(200).send(user);
});

// Accept or reject friend request
app.post('/respond-friend-request', async (req, res) => {
  const { userId, fromUserId, status } = req.body;

  const user = await User.findById(userId);
  const request = user.friendRequests.find(req => req.fromUser.toString() === fromUserId);
  if (request) {
    request.status = status;
    if (status === 'accepted') {
      user.friends.push(fromUserId);
      const fromUser = await User.findById(fromUserId);
      fromUser.friends.push(userId);
      await fromUser.save();
    }
    await user.save();
    res.status(200).send(user);
  } else {
    res.status(404).send({ message: 'Friend request not found' });
  }
});

// Create post
app.post('/post', async (req, res) => {
  const { userId, content } = req.body;

  const post = new Post({ userId, content });
  await post.save();

  res.status(201).send(post);
});

// Comment on post
app.post('/comment', async (req, res) => {
  const { postId, userId, comment } = req.body;

  const post = await Post.findById(postId);
  post.comments.push({ userId, comment });
  await post.save();

  res.status(201).send(post);
});

// Get feed
app.get('/feed/:userId', async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId).populate('friends');

  const friendsIds = user.friends.map(friend => friend._id);

  const posts = await Post.find({
    $or: [
      { userId: { $in: friendsIds } },
      { 'comments.userId': { $in: friendsIds } }
    ]
  }).sort({ createdAt: -1 }).populate('userId').populate('comments.userId');

  res.status(200).send(posts);
});

const PORT = 4800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
