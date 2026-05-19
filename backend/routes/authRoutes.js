const express = require('express');
const passport = require('passport');

const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  googleCallbackSuccess,
} = require('../controllers/authController');

const requireAuth = require('../middlewares/requireAuth');

const {
  uploadProfilePicture,
  uploadRegisterPicture,
} = require('../middlewares/uploadProfilePicture');

const handleUploadError = require('../middlewares/handleUploadError');


// ================= NORMAL AUTH =================

router.post(
  '/register',
  uploadRegisterPicture,
  handleUploadError,
  register
);

router.post('/login', login);

router.post('/logout', logout);

router.get('/me', requireAuth, getMe);

router.put(
  '/profile',
  requireAuth,
  uploadProfilePicture,
  handleUploadError,
  updateProfile
);


// ================= GOOGLE AUTH =================

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleCallbackSuccess
);


module.exports = router;