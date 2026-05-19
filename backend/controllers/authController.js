const path = require('path');
const passport = require('passport');
const User = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { signToken } = require('../utils/jwt');
const { formatUser } = require('../utils/formatUser');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function getAvatarPathFromFile(file) {
  if (!file) return null;
  const relativePath = path.posix.join('/uploads/profile-pictures', file.filename);
  return relativePath;
}

function loginUserSession(req, user) {
  return new Promise((resolve, reject) => {
    req.login(user, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function register(req, res) {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const avatar = getAvatarPathFromFile(req.file);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: name?.trim(),
      phone: phone?.trim(),
      avatar,
      authProvider: 'local',
    });

    await loginUserSession(req, user);

    const token = signToken({ userId: user._id, email: user.email });

    return res.status(201).json({
      user: formatUser(user),
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.message && error.message.includes('images')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

async function login(req, res) {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    try {
      await loginUserSession(req, user);
      const token = signToken({ userId: user._id, email: user.email });
      return res.json({
        user: formatUser(user),
        token,
      });
    } catch (sessionError) {
      console.error('Session login error:', sessionError);
      return res.status(500).json({ error: 'Server error' });
    }
  })(req, res);
}

async function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ user: formatUser(req.user) });
}

async function updateProfile(req, res) {
  try {
    const user = req.user;
    const { name, phone, password, currentPassword } = req.body;

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (req.file) {
      user.avatar = getAvatarPathFromFile(req.file);
    }

    if (password) {
      if (user.authProvider !== 'local' || !user.password) {
        return res.status(400).json({
          error: 'Password can only be changed for local accounts',
        });
      }

      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      const isValid = await comparePassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      user.password = await hashPassword(password);
    }

    await user.save();

    return res.json({ user: formatUser(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.message && error.message.includes('images')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

async function logout(req, res) {
  req.logout(function (err) {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ ok: true });
    });
  });
}

async function registerSession(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.redirect('/register?error=Email and password are required');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.redirect('/register?error=User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name,
      authProvider: 'local',
    });

    req.login(user, function (err) {
      if (err) {
        console.error('Register session login error:', err);
        return res.redirect('/register?error=Unable to sign in');
      }
      return res.redirect('/dashboard');
    });
  } catch (error) {
    console.error('Register session error:', error);
    return res.redirect('/register?error=Server error');
  }
}

function googleCallbackSuccess(req, res) {
  const redirectUrl =
    process.env.GOOGLE_SUCCESS_REDIRECT || `${FRONTEND_URL}/dashboard`;
  return res.redirect(redirectUrl);
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  registerSession,
  googleCallbackSuccess,
};
