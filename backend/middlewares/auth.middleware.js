import jwt from "jsonwebtoken";
import UserModel from "../models/users.model.js";
const verifyUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      vcode: 1,
      msg: "Don't have token, invalid token or token expired",
    });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        vcode: 1,
        msg: "Don't have token, invalid token or token expired",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  // kiểm tra role trong roles
  if (!req.user || !req.user.role) {
    return res.status(403).json({
      vcode: 1,
      msg: "Access denied",
    });
  }

  const user = await UserModel.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({
      vcode: 1,
      msg: "User not found",
    });
  }

  if (user.role !== "admin" && user.role !== "organizer") {
    return res.status(403).json({
      vcode: 1,
      msg: "Access denied",
    });
  }
  next();
};

export default {
  verifyUser,
  verifyAdmin,
};
