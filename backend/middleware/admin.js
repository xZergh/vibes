module.exports = function(req, res, next) {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};