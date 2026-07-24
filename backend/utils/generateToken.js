import jwt from 'jsonwebtoken';

// Signs a JWT carrying just enough to authenticate + authorize requests.
// Keep the payload small — full user data is fetched fresh in authenticate.js.
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export default generateToken;
