export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No credentials found.',
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this resource.',
      });
    }

    next();
  };
};

