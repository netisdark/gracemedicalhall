import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import auditService from './audit.service.js';

class AuthService {
  async login(username, password) {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid username or password', 401);
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkey_gracemedicalhall_nepal_2026',
      { expiresIn: '8h' }
    );

    await auditService.log(user._id, 'login', 'User', user._id, `${user.username} logged in`);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    };
  }

  async signup(username, password) {
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      throw new AppError('Username is already taken', 409);
    }

    const user = new User({ username: username.toLowerCase(), password, role: 'staff' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'supersecretjwtkey_gracemedicalhall_nepal_2026',
      { expiresIn: '8h' }
    );

    await auditService.log(user._id, 'signup', 'User', user._id, `${user.username} created an account`);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    };
  }

  async verifyUser(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

export const authService = new AuthService();
export default authService;
