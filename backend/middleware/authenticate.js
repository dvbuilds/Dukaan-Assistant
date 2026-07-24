import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

// Verifies the Bearer JWT and attaches the full user doc (minus password)
// to req.user. Downstream authorize()/controllers rely on req.user existing.
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authenticated. Missing or invalid Authorization header.');
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authenticated. Invalid or expired token.');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(401, 'Not authenticated. User no longer exists.');
  }

  req.user = user;
  next();
});

export default authenticate;
