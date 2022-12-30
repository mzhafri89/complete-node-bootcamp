const jwt = require('jsonwebtoken');
const { promisify } = require('util');
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
    passwordUpdatedAt: req.body.passwordUpdatedAt,
    photo: req.body.photo,
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

exports.tokenGuard = catchAsync(async (req, res, next) => {
  //get token
  const {
    headers: { authorization },
  } = req;
  let token = '';

  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Unauthorized: 001', 401));
  }
  // verify token
  const payload = await promisify(jwt.verify)(token, JWT_SECRET);
  //check if user exist
  const validUser = await User.findById(payload.id);

  if (!validUser) {
    return next(new AppError('Unauthorized: 002', 401));
  }
  //check if user password changed after token is issued
  if (validUser.isPasswordChanged(payload.iat)) {
    return next(new AppError('Unauthorized: 003', 401));
  }

  //pass down the middleware chain
  req.user = validUser;
  next();
});
