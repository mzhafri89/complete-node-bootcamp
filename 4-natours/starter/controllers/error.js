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

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    handleDevError(error, res);
  } else {
    let errorCopy;

    //convert db error to operational error
    if (error.name === 'CastError') {
      errorCopy = handleDatabaseCastError(error);
    }

    handleError(errorCopy, res);
  }
};
