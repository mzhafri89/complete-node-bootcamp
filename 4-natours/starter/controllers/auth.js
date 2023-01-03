const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const {
  env: { JWT_SECRET, JWT_EXPIRES_IN },
} = process;

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

exports.register = catchAsync(async (req, res, next) => {
  //manually specified the field so that we only register user with current fields
  const {
    body: {
      name,
      email,
      password,
      passwordConfirm,
      passwordUpdatedAt,
      photo,
      role,
    },
  } = req;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordUpdatedAt,
    photo,
    role,
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

exports.roleGuard = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: 001', 403));
    }

    next();
  });

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('No user registered with given email.', 404));
  }

  //generate reset password token and save encrypted token into db
  const token = user.createPasswordResetToken();
  //tell odm to not validate
  await user.save({ validateBeforeSave: false });

  //send email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${token}`;

  const message = `Click on the link to reset your password: ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset link',
      message,
    });
  } catch (error) {
    //if there's an error from nodemail, reset the token
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Failed to send a reset password link to user email. Please try again later',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to the user email address',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const {
    body: { password, passwordConfirm },
    params: { token },
  } = req;

  //get user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Reset token is invalid.', 400));
  }
  //token !expired && user exist, set new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  //when save is resolved, the write operation might not be completed yet.
  await user.save();
  //update passwordUpdatedAt field - done by model middleware
  //log the user in, send jwt
  const jwtToken = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    token: jwtToken,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const {
    headers: { authorization },
    body: { newPassword, newPasswordConfirm, currentPassword },
  } = req;
  //get user
  const token = authorization.split(' ')[1];
  const payload = await promisify(jwt.verify)(token, JWT_SECRET);
  const user = await User.findById(payload.id).select('+password');

  //verify current password is correct
  if (!user || !(await user.validatePassword(currentPassword, user.password))) {
    //only give vague information on why the login was failing
    return next(new AppError('Incorrect password', 401));
  }

  //update password - validation would be done by schema validator
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  //send jwt
  const newToken = generateToken(user._id);

  return res.status(200).json({
    status: 'success',
    token: newToken,
  });
});
