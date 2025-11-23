import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded) {
        return res
          .status(401)
          .json({ message: "Unauthorized - Invalid token" });
      }

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized - User not found" });
      }

      req.user = user;

      next();
    } catch (error) {
      if (error == "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access Token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied - Admin Only" });
  }
};
