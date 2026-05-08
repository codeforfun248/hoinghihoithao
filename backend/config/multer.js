import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads/");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdir(uploadDir + req.body.folder, { recursive: true }, (err) => {
      if (err) return cb(err, null);
      cb(null, uploadDir + req.body.folder);
    });
  },
  filename: function (req, file, cb) {
    // Tạo chuỗi unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Ghép vào tên file gốc
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;
