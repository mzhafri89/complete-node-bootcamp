const jwt = require('jsonwebtoken');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const {
  env: { JWT_SECRET, JWT_EXPIRES_IN },
} = process;

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

exports.register = catchAsync(async (req, res, next) => {
  //manually specified the field so that we only register user with current fields
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = generateToken(user._id);

  //exclude password from being output
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const {
    body: { email, password },
  } = req;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //.select('+password') will select hidden fields
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.validatePassword(password, user.password))) {
    //only give vague information on why the login was failing
    return next(new AppError('Invalid email or password', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
