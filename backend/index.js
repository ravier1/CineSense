import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import mongoose from 'mongoose';
import axios from 'axios';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

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
    console.error('TMDB proxy error:', error);
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

export default serverless(app);
