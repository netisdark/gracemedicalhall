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

  // Admin registers a staff member; adminId is the creator
  async signup(username, password, adminId) {
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      throw new AppError('Username is already taken', 409);
    }

    const user = new User({ username: username.toLowerCase(), password, role: 'staff' });
    await user.save();

    await auditService.log(adminId, 'create', 'User', user._id, `Admin registered staff: ${user.username}`);

    return {
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

  // Update username and/or password for a user
  async updateProfile(userId, { username, currentPassword, newPassword }, actorId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (username && username.toLowerCase() !== user.username) {
      const taken = await User.findOne({ username: username.toLowerCase() });
      if (taken) throw new AppError('Username already taken', 409);
      user.username = username.toLowerCase();
    }

    if (newPassword) {
      if (currentPassword) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) throw new AppError('Current password is incorrect', 401);
      }
      user.password = newPassword;
    }

    await user.save();
    await auditService.log(actorId, 'update', 'User', user._id, `Profile updated for: ${user.username}`);

    return { id: user._id, username: user.username, role: user.role };
  }

  async getAllUsers() {
    return User.find().select('-password').sort({ createdAt: -1 });
  }

  async deleteUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'admin') throw new AppError('Cannot delete admin accounts', 403);
    await User.findByIdAndDelete(userId);
    await auditService.log(adminId, 'delete', 'User', userId, `Admin removed staff: ${user.username}`);
  }
}

export const authService = new AuthService();
export default authService;

