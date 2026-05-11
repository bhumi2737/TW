const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  // 🔥 Password ko optional (required: false) kiya gaya hai 
  // kyunki Google users bina password ke login karenge
  password: { 
    type: String, 
    required: false 
  },
  name: { 
    type: String, 
    trim: true 
  },
  // 🔥 Google users ke liye googleId field add ki gayi hai
  googleId: {
    type: String,
    unique: true,
    sparse: true // Taaki normal users ko problem na ho
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('User', userSchema);