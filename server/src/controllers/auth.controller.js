import authService from '../services/auth.service.js';
import crypto from 'crypto';


export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    const csrfToken = crypto.randomBytes(24).toString('hex');
    const isProd = process.env.NODE_ENV === 'production';

    // HTTP-only token cookie for authentication
    // sameSite: 'none' is required for cross-origin cookie sending (e.g. Netlify -> Render)
    // secure: true is required when sameSite is 'none'
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,           // must be true in prod for sameSite: none to work
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    // Client-readable cookie for double-submit CSRF validation
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    console.log(`[AUTH] Login successful for: ${result.user.username} | env: ${process.env.NODE_ENV} | sameSite: ${isProd ? 'none' : 'lax'}`);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        csrfToken
      },
      message: 'Successfully authenticated'
    });
  } catch (error) {
    next(error);
  }
};

// Admin registers a new staff account (no auto-login)
export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.signup(username, password, req.user.id);

    res.status(201).json({
      success: true,
      data: { user: result.user },
      message: `Staff account "${result.user.username}" created successfully`
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    // Must pass the same options used when setting the cookie, otherwise browser ignores the clear
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    };
    res.clearCookie('token', cookieOptions);
    res.clearCookie('csrfToken', { ...cookieOptions, httpOnly: false });
    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const user = await authService.verifyUser(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      },
      message: 'Session is active'
    });
  } catch (error) {
    next(error);
  }
};

// Any logged-in user can update their own profile; admins can update any user
export const updateProfile = async (req, res, next) => {
  try {
    const { targetUserId, username, currentPassword, newPassword } = req.body;
    const userId = (req.user.role === 'admin' && targetUserId) ? targetUserId : req.user.id;
    const updated = await authService.updateProfile(userId, { username, currentPassword, newPassword }, req.user.id);
    res.status(200).json({
      success: true,
      data: { user: updated },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: list all users (for staff management)
export const getUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({
      success: true,
      data: { users },
      message: 'Users retrieved'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: delete a staff user
export const deleteUser = async (req, res, next) => {
  try {
    await authService.deleteUser(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: null,
      message: 'User account removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

