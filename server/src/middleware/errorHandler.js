export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Handle mongoose Duplicate Key Error
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue);
    const value = err.keyValue[keys[0]];
    error = new AppError(`Duplicate field value: "${value}". Please use another value!`, 400);
  }

  // Handle mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(el => el.message);
    error = new AppError(`Invalid input: ${messages.join('. ')}`, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication session has expired. Please log in again.', 401);
  }

  const response = {
    success: false,
    message: error.message || 'Something went wrong on the server'
  };

  // Log internal 500 crashes
  if (error.statusCode === 500) {
    console.error('SERVER ERROR:', err);
    if (process.env.NODE_ENV === 'production') {
      response.message = 'An internal server error occurred.';
    }
  }

  res.status(error.statusCode).json(response);
};
