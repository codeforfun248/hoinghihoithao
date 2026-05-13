import multer from "multer";
import fs from "fs";
import path from "path";

const chatUploadDir = path.join(process.cwd(), "uploads/chat");

// Tạo thư mục chat nếu chưa có
fs.mkdirSync(chatUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, chatUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const uploadChat = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file hình ảnh"));
    }
    cb(null, true);
  },
});

export default uploadChat;
