import customError from "../utils/custom-error.js";

const errorHandler = (err, req, res, next) => {
  console.error("🔥 LỖI TỪ BACKEND TRẢ VỀ FRONTEND:", err.message);

  // Lỗi tự định nghĩa
  if (err instanceof customError) {
    return res.status(err.statusCode).json({ msg: err.message, vcode: 1 });
  }

  // Mongoose ValidationError — field required bị thiếu hoặc sai kiểu
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      vcode: 1,
      msg: "Dữ liệu không hợp lệ: " + messages.join(", "),
    });
  }

  // Mongoose CastError — ID không hợp lệ
  if (err.name === "CastError") {
    return res.status(400).json({
      vcode: 1,
      msg: `Giá trị không hợp lệ cho trường ${err.path}`,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      vcode: 1,
      msg: `Giá trị đã tồn tại: ${field}`,
    });
  }

  // Lỗi chung
  return res.status(500).json({
    msg: err.message || "Lỗi server",
    vcode: 1,
  });
};

export default errorHandler;
