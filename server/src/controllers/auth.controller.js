import authService from '../services/auth.service.js';
import crypto from 'crypto';


export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    const csrfToken = crypto.randomBytes(24).toString('hex');
    const isProd = process.env.NODE_ENV === 'production';

    // HTTP-only token cookie for authentication
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    // Client-readable cookie for double-submit CSRF validation
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000
    });

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

export const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.signup(username, password);

    const csrfToken = crypto.randomBytes(24).toString('hex');
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        csrfToken
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.clearCookie('csrfToken');
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
