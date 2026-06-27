import { AppError } from './errorHandler.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map(err => {
        const path = err.path.join('.');
        return `${path ? path + ': ' : ''}${err.message}`;
      });
      return next(new AppError(`Validation error: ${messages.join('; ')}`, 400));
    }
    // Assign validated and preprocessed data to request body
    req.body = result.data;
    next();
  } catch (error) {
    next(error);
  }
};
