const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const requireAuth = require('../middlewares/requireAuth');
const {
  uploadProfilePicture,
  uploadRegisterPicture,
} = require('../middlewares/uploadProfilePicture');
const handleUploadError = require('../middlewares/handleUploadError');

router.post('/register', uploadRegisterPicture, handleUploadError, register);
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

module.exports = router;
