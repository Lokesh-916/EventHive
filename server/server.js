const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);


const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhive_db').then(() => {
  console.log('MongoDB Connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

app.use(helmet({
  contentSecurityPolicy: false // disabled to allow inline styles/scripts for demo
}));
app.use(morgan('dev'));

// Ensure HTML files are served with UTF-8 charset
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || !req.path.includes('.')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  next();
});

// Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 reqs per window
});
app.use('/api/auth/', authLimiter);

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const applicationRoutes = require('./routes/applications');
const incidentRoutes = require('./routes/incidents');
const organizerRoutes = require('./routes/organizer');
const offerRoutes = require('./routes/offers');
const reputationRoutes = require('./routes/reputation');
const analyticsRoutes  = require('./routes/analytics');
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api', organizerRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Static file setup for uploads and client
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));
app.use(express.static(path.join(__dirname, '../client')));

// Route handlers for clean URLs
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/support.html'));
});

app.get('/create-event', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/create-event.html'));
});

app.get('/event-info', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/event-info.html'));
});

app.get('/report-incident', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/report-incident.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/home.html'));
});

app.get('/organiser-home', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/organiser-home.html'));
});

app.get('/organiser', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/organiser.html'));
});

app.get('/client-home', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/client-home.html'));
});

app.get('/rate-organizer', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/rate-organizer.html'));
});

app.get('/organiser-profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/organiser-profile.html'));
});

app.get('/all-events', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/all-events.html'));
});

app.get('/event-overview', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/event-overview.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/profile.html'));
});

app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/analytics.html'));
});

// Generic 404 handler for API vs Front-end
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ success: false, error: 'API route not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, '../client/index.html'));
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
