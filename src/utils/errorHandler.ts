import { ErrorRequestHandler } from 'express';
import { ApiError } from './ApiError';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Access token expired';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Log unexpected errors
  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(statusCode === 401 && { code: 'UNAUTHORIZED' }) // Additional error code
  });
};