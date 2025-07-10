const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header - check both custom and standard headers
  const token = req.header('x-auth-token') || 
                (req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null);

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};