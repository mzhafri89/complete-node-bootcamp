const AppError = require('../utils/appError');

const handleDevError = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

const handleError = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.error(error);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
};

const handleDatabaseCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;

  return new AppError(message, 400);
};

const handleDatabaseDuplicateKeyError = (error) => {
  const message = `Duplicate key: ${JSON.stringify(error.keyValue)}`;

  return new AppError(message, 400);
};

const handleDatabaseValidationError = (error) => {
  const invalidFields = Object.values(error.errors).map((err) => err.message);
  const message = `Validation errors: ${invalidFields.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token.', 401);

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    handleDevError(error, res);
  } else {
    let errorCopy;

    //convert db error to operational error - not necessarily needed since the general consensus is, if its not http error, return 500
    if (error.name === 'CastError') {
      errorCopy = handleDatabaseCastError(error);
    }

    if (error.code === 11000) {
      errorCopy = handleDatabaseDuplicateKeyError(error);
    }

    if (error.name === 'ValidationError') {
      errorCopy = handleDatabaseValidationError(error);
    }

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      errorCopy = handleJWTError();
    }

    handleError(errorCopy || error, res);
  }
};
