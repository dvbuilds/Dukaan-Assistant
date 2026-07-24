import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Run after an array of express-validator checks in a route, e.g.:
// router.post('/', [body('email').isEmail()], validateRequest, controller)
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(400, 'Validation failed', details));
  }
  next();
};

export default validateRequest;
