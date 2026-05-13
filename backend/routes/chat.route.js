import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as chatController from "../controllers/chat.controller.js";
import uploadChat from "../config/multer-chat.js";
import asyncHandler from "express-async-handler";
import customError from "../utils/custom-error.js";
import multer from "multer";

const router = express.Router();

// ─── Upload ảnh chat ──────────────────────────────────────────────────────────
router.post(
  "/upload-image",
  authMiddleware.verifyUser,
  (req, res, next) => {
    uploadChat.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ vcode: 1, msg: "Hình ảnh không được vượt quá 10MB" });
        }
      } else if (err) {
        return res.status(400).json({ vcode: 1, msg: err.message });
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) throw new customError("Không có file được tải lên", 400);
    const url = `${process.env.URL_BACKEND}/uploads/chat/${req.file.filename}`;
    res.json({ vcode: 0, msg: "Tải lên thành công", data: url });
  })
);

// ─── User routes ─────────────────────────────────────────────────────────────
router.get("/my-messages", authMiddleware.verifyUser, chatController.getMyMessages);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get(
  "/conversations",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  chatController.getConversationList
);

router.get(
  "/conversations/:userId",
  authMiddleware.verifyUser,
  authMiddleware.verifyAdmin,
  chatController.getMessagesByUser
);

// ─── Shared routes ────────────────────────────────────────────────────────────
router.delete("/:messageId", authMiddleware.verifyUser, chatController.deleteMessage);
router.put("/:messageId", authMiddleware.verifyUser, chatController.editMessage);

export default router;
