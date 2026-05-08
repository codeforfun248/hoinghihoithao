import customError from "../utils/custom-error.js";

const errorHandler = (err, req, res, next) => {
  console.error("🔥 LỖI TỪ BACKEND TRẢ VỀ FRONTEND:", err.message);
  if (err instanceof customError) {
    return res
      .status(err.statusCode)
      .json({ msg: err.message, vcode: err.vcode });
  }
  return res.status(500).json({
    msg: err.message,
    vcode: 1,
  });
};

export default errorHandler;
