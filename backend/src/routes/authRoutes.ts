import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user (Free tier by default)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please enter all required fields.' });
      return;
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'An account with that email already exists.' });
      return;
    }

    // 3. Encrypt/Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create and save the new user
    const newUser = new User({
      name,
      email,
      passwordHash
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get session token
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400).json({ message: 'Please enter all fields.' });
      return;
    }

    // 2. Locate user in the database
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    // 3. Verify incoming password against the hashed database password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    // 4. Check for JWT secret insurance
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Server configuration error: Missing JWT secret token key.' });
      return;
    }

    // 5. Generate the session token valid for 1 day
    const token = jwt.sign(
      { id: user._id, accountTier: user.accountTier },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // 6. Return user metadata and token to frontend
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountTier: user.accountTier
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;