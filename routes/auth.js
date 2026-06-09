import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const SESSION_DURATION = '7d';

function normalizePhone(phone) {
  return String(phone).replace(/\D/g, '');
}

function isValidPhone(phone) {
  return /^\d{10,15}$/.test(phone);
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: SESSION_DURATION });
}

function userResponse(user) {
  return { id: user._id, name: user.name, phone: user.phone };
}

router.post('/register', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim() || !phone) {
      return res.status(400).json({ message: 'Full name and phone number are required' });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({ message: 'Enter a valid phone number (10–15 digits)' });
    }

    const existing = await User.findOne({ phone: normalizedPhone });
    if (existing) {
      return res.status(409).json({ message: 'Phone number already registered. Please sign in.' });
    }

    const user = await User.create({ name: name.trim(), phone: normalizedPhone });
    await UserProgress.create({ userId: user._id });

    const token = signToken(user._id);
    res.status(201).json({ token, user: userResponse(user) });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Phone number already registered. Please sign in.' });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({ message: 'Enter a valid phone number (10–15 digits)' });
    }

    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      return res.status(404).json({ message: 'No account found. Please create an account first.' });
    }

    const token = signToken(user._id);
    res.json({ token, user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sign in failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: userResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

export default router;
