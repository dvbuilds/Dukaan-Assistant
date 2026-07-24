import ApiError from '../utils/ApiError.js';

// Usage: router.post('/shops', authenticate, authorize('shopkeeper'), createShop)
// Must run after authenticate — relies on req.user being set.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not permitted to perform this action.`)
      );
    }
    next();
  };
};

export default authorize;
