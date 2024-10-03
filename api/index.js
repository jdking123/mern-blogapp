require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const mime = require('mime-types');

const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;  // Use secret from .env file

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
}));

app.use(express.json());
app.use(cookieParser());

// Mongoose connection
mongoose.set('strictQuery', false);  // Handle deprecation warning
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000  // Increase timeout to 30 seconds
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,  // Added AWS_REGION to your env variables
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
});

// Multer setup for file uploads in memory
const uploadMiddleware = multer({ storage: multer.memoryStorage() });

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Function to upload to AWS S3 using buffer
async function uploadToS3(buffer, originalFileName, mimeType) {
  const s3Key = `uploads/${Date.now()}-${originalFileName}`;
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: buffer,
    ContentType: mimeType || mime.lookup(originalFileName),
    ACL: 'public-read'
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    return s3Url;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
}

app.options('/register', cors()); // Enable preflight requests for /api/register

// Register Route
app.post('/api/register', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    next(e);
  }
});

// Login Route
app.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(404).json('User not found');
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      const token = jwt.sign({ username, id: userDoc._id }, secret);
      res.cookie('token', token).json({
        id: userDoc._id,
        username,
      });
    } else {
      res.status(401).json('Wrong credentials');
    }
  } catch (e) {
    next(e);
  }
});

// Profile Route
app.get('/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Logout Route
app.post('/logout', (req, res) => {
  res.cookie('token', '').json('Logged out');
});

// Create Post Route
app.post('/post', uploadMiddleware.single('file'), async (req, res, next) => {
  const { originalname, buffer, mimetype } = req.file;  
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return next(err);

    try {
      const s3Url = await uploadToS3(buffer, originalname, mimetype);
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: s3Url,
        author: info.id,
      });
      res.json(postDoc);
    } catch (err) {
      next(err);
    }
  });
});

// Update Post Route
app.put('/post', uploadMiddleware.single('file'), async (req, res, next) => {
  let s3Url = null;
  if (req.file) {
    const { originalname, buffer, mimetype } = req.file;
    s3Url = await uploadToS3(buffer, originalname, mimetype);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return next(err);
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(403).json('You are not the author');
    }

    await Post.updateOne(
      { _id: id },
      {
        title,
        summary,
        content,
        cover: s3Url ? s3Url : postDoc.cover,
      }
    );

    res.json(postDoc);
  });
});

// DELETE route for deleting a post
app.delete('/post/:id', authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (req.user.id !== post.author.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get All Posts Route
app.get('/post', async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    next(error);
  }
});

// Get Single Post by ID Route
app.get('/post/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', ['username']);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const fullImageUrl = post.cover;

    res.json({
      ...post.toObject(),
      cover: fullImageUrl  
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
