const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'eventhive_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', upload.any(), async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    
    // Check if user exists
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, error: 'User already exists' });
    userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ success: false, error: 'Username already taken' });

    // Profile object based on role
    let profile = {};
    
    if (role === 'organizer') {
      profile.orgName = req.body.orgName;
      profile.leadName = req.body.leadName;
      profile.organization = req.body.organization;
      profile.eventTypes = req.body.eventTypes ? JSON.parse(req.body.eventTypes) : [];
      profile.officialEmail = req.body.officialEmail;
      profile.mobile = req.body.mobile;
      profile.website = req.body.website;
      profile.bio = req.body.bio;
      profile.location = {
        city: req.body.city, state: req.body.state, country: req.body.country,
        coordinates: req.body.coordinates ? req.body.coordinates.split(',').map(Number) : []
      };
      // Files handled by multer req.files
      const logoFile = req.files?.find(f => f.fieldname === 'org-logo-upload');
      if (logoFile) profile.logo = `data:${logoFile.mimetype};base64,${logoFile.buffer.toString('base64')}`;
    } else if (role === 'volunteer') {
      profile.fullName = req.body.fullName;
      profile.skills = req.body.skills ? JSON.parse(req.body.skills) : [];
      profile.availability = req.body.availability ? JSON.parse(req.body.availability) : {};
      profile.location = {
        city: req.body.city, state: req.body.state, country: req.body.country,
        coordinates: req.body.coordinates ? req.body.coordinates.split(',').map(Number) : []
      };
      const picFile = req.files?.find(f => f.fieldname === 'vol-profile-pic');
      if (picFile) profile.profilePic = `data:${picFile.mimetype};base64,${picFile.buffer.toString('base64')}`;
    } else if (role === 'client') {
      profile.clientName = req.body.clientName;
      profile.clientType = req.body.clientType;
      profile.clientRole = req.body.clientRole;
      profile.mobile = req.body.mobile;
      profile.website = req.body.website;
      const picFile = req.files?.find(f => f.fieldname === 'client-pic-upload');
      if (picFile) profile.profilePic = `data:${picFile.mimetype};base64,${picFile.buffer.toString('base64')}`;
    } else {
        return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await User.create({
      email, username, password_hash: password, role, profile
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email }).select('+password_hash');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    res.status(200).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/auth/profile/:id
// @desc    Get any user's profile by ID (read-only, for organizers viewing volunteers)
// @access  Private
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { username, profile } = req.body;

    // Update username if provided and not taken
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ success: false, error: 'Username already taken' });
      user.username = username;
    }

    // Build a flat $set map using dot-notation so nested fields
    // (e.g. profile.location.city) are merged rather than replaced.
    if (profile && typeof profile === 'object') {
      const setMap = {};

      function flatten(obj, prefix) {
        Object.keys(obj).forEach(key => {
          const val  = obj[key];
          const path = prefix ? `${prefix}.${key}` : key;
          // Recurse into plain objects (but NOT arrays or null)
          if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
            flatten(val, path);
          } else {
            setMap[`profile.${path}`] = val;
          }
        });
      }

      flatten(profile, '');

      const updated = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { ...setMap, ...(username ? { username } : {}) } },
        { new: true, runValidators: true }
      );
      return res.status(200).json({ success: true, data: updated });
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
