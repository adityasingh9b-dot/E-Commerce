import jwt from 'jsonwebtoken';

const generatedAccessToken = (userId) => {
  // Hum userId pass kar rahe hain directly ya pura object, dono handle ho jayenge
  const id = userId._id || userId;

  return jwt.sign(
    { _id: id }, 
    process.env.SECRET_KEY_ACCESS_TOKEN, 
    { 
      expiresIn: '365d' // ✅ Sabke liye 1 saal (Never Logout vibe)
    }
  );
};

export default generatedAccessToken;
