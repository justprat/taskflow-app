import authService from '../services/authService.js';

/**
 * AuthController binds incoming HTTP authentication requests to AuthService logic.
 */
class AuthController {
  /**
   * Handle user signup.
   */
  async signup(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.signup({ email, password, name });
      
      return res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: result
      });
    } catch (error) {
      next(error); // Passes to errorMiddleware
    }
  }

  /**
   * Handle user login.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch current authenticated user info (from token decoded in authMiddleware).
   */
  async me(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout helper (stateless JWT logout simply acknowledges the action,
   * actual token deletion is performed client-side).
   */
  async logout(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully. Please delete the token from local storage.'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
