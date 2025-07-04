const supabase = require('../config/supabase'); // Adjust path as needed

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using Supabase service_role key
      // This will validate the JWT and return the user if valid
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      req.user = user; // Attach the user object to the request
      next();

    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Optional authentication middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using Supabase service_role key
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = user; // Attach the user object to the request if valid
      }
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      // Don't fail, just continue without user
    }
  }

  next(); // Always continue to next middleware
};

module.exports = { protect, optionalAuth };
