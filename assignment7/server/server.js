const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Feedback = require('./models/Feedback');

const app = express();
const PORT = 5001;
const MONGO_URI = 'mongodb://127.0.0.1:27017/assignment7';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected to context: assignment7'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Student Feedback API is Running</h1><p>Visit <a href="/api/feedback">/api/feedback</a> to see data.</p>');
});

// @route   GET /api/feedback
// @desc    Get all feedback entries
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/feedback
// @desc    Submit a new feedback entry
app.post('/api/feedback', async (req, res) => {
  const { studentName, subject, rating, comment } = req.body;
  
  if (!studentName || !subject || !rating || !comment) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newFeedback = new Feedback({
    studentName,
    subject,
    rating,
    comment
  });

  try {
    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/stats
// @desc    Get aggregate stats
app.get('/api/stats', async (req, res) => {
  try {
    const feedback = await Feedback.find();
    const total = feedback.length;
    const avgRating = total > 0 
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) 
      : 0;
    
    res.json({ total, avgRating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/ping
// @desc    Check server health
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, '127.0.0.1', () => console.log(`🚀 Server running on http://127.0.0.1:${PORT}`));
