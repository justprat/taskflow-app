import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

/**
 * Authentication Middleware.
 * Verifies the JWT Bearer token, then queries the database to load the latest
 * up-to-date user credentials. This prevents stale user profile details (like email/name changes)
 * or deleted accounts from bypassing authentication.
 */
export default async function authMiddleware(req, res, next) {
  // Get Authorization header (usually formatted as "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization header with Bearer token is required.'
    });
  }

  // Extract the token part
  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the freshest details directly from the database using the user ID
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User account does not exist or has been deleted.'
      });
    }

    // Attach the fresh user information payload to the request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    // Pass control to the next middleware or controller in the pipeline
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid, expired, or malformed authentication token.'
    });
  }
}
