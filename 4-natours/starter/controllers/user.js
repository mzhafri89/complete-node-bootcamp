const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

exports.getAllUser = (req, res) => {};

exports.createUser = (req, res) => {};

exports.getUser = (req, res) => {};

exports.updateUser = (req, res) => {};

exports.deleteUser = (req, res) => {};

exports.updateAuthenticatedUserDetails = catchAsync(async (req, res, next) => {
  const {
    body: { password, passwordConfirm, email, name },
    user,
  } = req;

  if (password || passwordConfirm) {
    return next(
      new AppError('Only name and email field is allowed to be updated.', 400)
    );
  }

  //only update selected field
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      ...(name && { name }),
      ...(email && { email }),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
