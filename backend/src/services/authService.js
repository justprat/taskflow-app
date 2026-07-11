import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

/**
 * AuthService coordinates authentication business logic.
 */
class AuthService {
  /**
   * Register a new user, hash password, and issue JWT.
   */
  async signup({ email, password, name }) {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('A user with this email address is already registered.');
      error.statusCode = 409; // Conflict
      throw error;
    }

    // 2. Hash password (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const newUser = await userRepository.create({
      email,
      name,
      password: hashedPassword
    });

    // 4. Generate JWT token
    const token = this.generateToken(newUser);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      token
    };
  }

  /**
   * Authenticate an existing user and issue a JWT.
   */
  async login({ email, password }) {
    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password credentials.');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // 2. Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      const error = new Error('Invalid email or password credentials.');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // 3. Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  }

  /**
   * Helper to sign JWT payload.
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
  }
}

export default new AuthService();
