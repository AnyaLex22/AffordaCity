const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, index: true },
  verificationTokenExpires: { type: Date },

  resetPasswordToken: { type: String, index: true },
  resetPasswordExpires: { type: Date },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);
