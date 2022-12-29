const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user name is required'],
    trim: true,
    minlength: [8, 'A user name must be of at least 8 characters'],
    maxlength: [100, "A user name can't exceed 100 characters"],
  },
  email: {
    type: String,
    required: [true, 'A user must be associated with an email address'],
    trim: true,
    unique: [true, 'The email address is already in use'],
    validate: {
      validator: validator.isEmail,
      message: 'The email address is invalid',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be of at least 8 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
  photo: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
