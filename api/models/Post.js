const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  title: String,
  summary: String,
  content: String,
  cover: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
