import upload from "../config/multer.js";
import multer from "multer";
// Middleware xử lý lỗi upload
export const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("file");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          vcode: 1,
          msg: "File is too large! Please choose an image under 2MB.",
        });
      }
    } else if (err) {
      return res.status(500).json({ vcode: 1, msg: err.message });
    }
    // Không có lỗi thì đi tiếp vào controller
    next();
  });
};
