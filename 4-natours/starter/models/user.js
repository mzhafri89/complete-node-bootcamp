const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'The email address is invalid',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be of at least 8 characters'],
    select: false, // will hide password during output
  },
  passwordConfirm: {
    //used only for validation, will be set to undefined after creation/update
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //only works on save/create
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: 'Password must match',
    },
  },
  photo: String,
});

//hashing/encryption password during save and update
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12); //will generate diff string even for the same pass
  this.passwordConfirm = undefined; //no need to persisted in db

  return next();
});

//instance method
userSchema.methods.validatePassword = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
