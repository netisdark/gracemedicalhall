// Trigger reload
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export const authMiddleware = async (req, res, next) => {
  try {
    console.log(`[AUTH MIDDLEWARE] ${req.method} ${req.path}`);
    console.log(`[AUTH MIDDLEWARE] cookies received:`, req.cookies);

    // 1. Double Submit Cookie CSRF Validation
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (stateChangingMethods.includes(req.method)) {
      const csrfCookie = req.cookies.csrfToken;
      const csrfHeader = req.headers['x-csrf-token'];

      console.log(`[AUTH MIDDLEWARE] CSRF cookie: ${csrfCookie ? 'present' : 'MISSING'}, header: ${csrfHeader ? 'present' : 'MISSING'}`);

      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        console.warn('[AUTH MIDDLEWARE] CSRF validation FAILED');
        return next(new AppError('CSRF token validation failed. Modifying operation blocked.', 403));
      }
    }

    // 2. JWT Authentication
    const token = req.cookies.token;
    console.log(`[AUTH MIDDLEWARE] JWT token: ${token ? `present (${token.length} chars)` : 'MISSING'}`);

    if (!token) {
      console.warn('[AUTH MIDDLEWARE] No token cookie found — returning 401');
      return next(new AppError('Access denied. Please log in.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_gracemedicalhall_nepal_2026');
    console.log(`[AUTH MIDDLEWARE] Token verified OK — user: ${decoded.username} (${decoded.role})`);
    req.user = decoded; // Contains { id, username, role }
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Token verification error:', error.message);
    next(new AppError('Session token is invalid or has expired. Please log in again.', 401));
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden. Admin permissions required.', 403));
  }
  next();
};
