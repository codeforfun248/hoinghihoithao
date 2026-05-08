import express from "express";
import uploadController from "../controllers/upload.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../middlewares/upload-size.middleware.js";

const router = express.Router();

// Định nghĩa route POST
// 'file' là tên trường (field name) mà Frontend gửi lên trong FormData
router.post(
  "/",
  authMiddleware.verifyUser,
  uploadMiddleware, // Middleware chạy trước để upload

  uploadController.uploadFile, // Controller chạy sau để trả về kết quả
);

export default router;
