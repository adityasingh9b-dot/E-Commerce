import jwt from 'jsonwebtoken';

const generatedAccessToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.SECRET_KEY_ACCESS_TOKEN,
    { expiresIn: '15m' }
  );
};

export default generatedAccessToken;

