import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import mongoose from 'mongoose';
import axios from 'axios';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from './models/User.js';
import Review from './models/Review.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`[MOCK EMAIL] To: ${email}, OTP: ${otp}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'CineSense - Verify Your Account',
    text: `Your OTP for CineSense registration is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

// Cached MongoDB connection
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing');
  }
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
  return cachedConnection;
}

// Global middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error('Database connection error:', err);
  }
  next();
});

// Cache interface for reviews (structured to be easily swapped for Redis)
const reviewCache = {
  async get(key) {
    return this.store.get(key);
  },
  async set(key, value) {
    this.store.set(key, value);
  },
  store: new Map()
};

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => {
  res.send('CineSense Backend API is running.');
});

// TMDB proxy endpoint
app.get('/api/movies/trending', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'TMDB API key is missing' });
    }
    const response = await axios.get('https://api.themoviedb.org/3/trending/movie/week', {
      params: { api_key: apiKey },
    });
    return res.json(response.data);
  } catch (error) {
    console.error('TMDB trending error:', error);
    return res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// TMDB search endpoint
app.get('/api/movies/search', async (req, res) => {
  try {
    const { query } = req.query;
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'TMDB API key is missing' });
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,
        query,
        include_adult: false
      },
    });
    return res.json(response.data);
  } catch (error) {
    console.error('TMDB search error:', error);
    return res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// AI Critic endpoint
app.post('/api/critic', async (req, res) => {
  const { movieId, title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Movie title is required' });
  }

  const cacheKey = movieId ? String(movieId) : title;
  const cachedReview = await reviewCache.get(cacheKey);

  if (cachedReview) {
    return res.json({ review: cachedReview, source: 'cache' });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Generate a 3-sentence spoiler-free review for the movie: "${title}".`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const review = completion.choices[0]?.message?.content?.trim();
    if (review) {
      await reviewCache.set(cacheKey, review);
    }
    return res.json({ review, source: 'ai' });
  } catch (error) {
    console.error('Groq AI error:', error);
    return res.status(500).json({ error: 'Failed to generate review' });
  }
});

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- REVIEW ROUTES ---

app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { movieId, movieTitle, rating, content } = req.body;
    const review = new Review({
      userId: req.user.userId,
      movieId,
      movieTitle,
      rating,
      content
    });
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save review' });
  }
});

app.get('/api/movies/:movieId/reviews', async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId }).populate('userId', 'email').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      return res.status(400).json({ error: 'User already exists and is verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      user = new User({
        email,
        password: hashedPassword,
        otp,
        otpExpires
      });
    }

    await user.save();
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({ error: 'Invalid credentials or user not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default serverless(app);
