import jwt from 'jsonwebtoken';

const generatedAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.SECRET_KEY_ACCESS_TOKEN,
    {
      expiresIn: user.role === "admin" ? "7d" : "2h",
    }
  );
};

export default generatedAccessToken;
