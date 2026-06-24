const jwt = require('jsonwebtoken');

/**
 * 🛡️ AUTHENTICATION MIDDLEWARE
 * Verifies the incoming JWT Bearer token from request headers.
 * Attaches decoded user payload to the request object if valid.
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and follows the 'Bearer' scheme
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // Verify token integrity using the environment's secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'udevs_secret_key_2026');

      // Bind the decoded payload (id, email, role) to the request object
      req.user = decoded;
      
      return next(); // Pass control to the next middleware or controller
    } catch (error) {
      console.error('❌ JWT VERIFICATION ERROR:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Token verification failed.'
      });
    }
  }

  // 2. Return error if no token is discovered in the headers
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided in headers.'
    });
  }
};

/**
 * 👥 AUTHORIZATION MIDDLEWARE
 * Restricts endpoint access to specific user roles (e.g., 'admin', 'intern').
 * Throws a 403 Forbidden error if the user's role is not whitelisted.
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Validate if the authenticated user's role exists in the permitted roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};