import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    // ✅ Get token from cookies or Authorization header
    const authHeader = req.headers?.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = req.cookies?.accessToken || tokenFromHeader;

    if (!token) {
      return res.status(401).json({
        message: "You need to Register/Login first, click on the profile picture option at above right corner",
        error: true,
        success: false,
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    if (!decoded || !decoded._id) {
      return res.status(401).json({
        message: "Unauthorized access",
        error: true,
        success: false,
      });
    }

    // ✅ Attach user ID to request
    req.userId = decoded._id;

    next();

  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(500).json({
      message: "Authentication failed",
      error: true,
      success: false,
    });
  }
};

export default auth;

