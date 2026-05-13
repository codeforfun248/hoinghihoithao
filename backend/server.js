import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import v1Router from "./routes/index.route.js";
import errorHandler from "./middlewares/error-handler.middleware.js";
import CorsConfig from "./config/cors.js";
import MessageModel from "./models/messages.model.js";
import UserModel from "./models/users.model.js";
import { sendMessageToSystemAdmin } from "./utils/telegramBot.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: CorsConfig.origin,
    credentials: true,
  },
});

// Middleware xác thực socket qua cookie token
io.use((socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    if (!tokenMatch) return next(new Error("Unauthorized"));

    const token = tokenMatch[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  // Mỗi user join vào room riêng của mình
  // Admin join vào room "admin"
  if (socket.userRole === "admin" || socket.userRole === "organizer") {
    socket.join("admin");
  } else {
    socket.join(`user_${socket.userId}`);
  }

  // ─── Gửi tin nhắn ──────────────────────────────────────────────────────────
  socket.on("send_message", async (data) => {
    try {
      const { content, imageUrl, conversationUserId } = data;

      // Xác định conversationUserId
      // Nếu là user thì conversationUserId = chính họ
      // Nếu là admin thì conversationUserId = user họ đang trả lời
      const convUserId =
        socket.userRole === "admin" || socket.userRole === "organizer"
          ? conversationUserId
          : socket.userId;

      if (!convUserId) return;
      if (!content?.trim() && !imageUrl) return;

      const message = await MessageModel.create({
        sender: socket.userId,
        senderRole: socket.userRole,
        conversationUserId: convUserId,
        content: content?.trim() || "",
        imageUrl: imageUrl || null,
      });

      const populated = await MessageModel.findById(message._id)
        .populate("sender", "name avatar role")
        .lean();

      // Đảm bảo conversationUserId là string để frontend so sánh dễ
      const msgToSend = {
        ...populated,
        _id: populated._id.toString(),
        conversationUserId: populated.conversationUserId.toString(),
        sender: {
          ...populated.sender,
          _id: populated.sender._id.toString(),
        },
      };

      // Gửi đến user liên quan
      io.to(`user_${convUserId}`).emit("new_message", msgToSend);
      // Gửi đến tất cả admin
      io.to("admin").emit("new_message", msgToSend);

      // Thông báo Telegram khi user nhắn cho admin
      if (socket.userRole === "user") {
        const sender = await UserModel.findById(socket.userId).select("name email");
        const msgText = content?.trim()
          ? `💬 <b>Tin nhắn CSKH mới!</b>\n\n👤 <b>${sender?.name || "Người dùng"}</b> (${sender?.email})\n📝 ${content.trim()}`
          : `💬 <b>Tin nhắn CSKH mới!</b>\n\n👤 <b>${sender?.name || "Người dùng"}</b> (${sender?.email})\n🖼 Đã gửi một hình ảnh`;
        sendMessageToSystemAdmin(msgText);
      }
    } catch (err) {
      console.error("Socket send_message error:", err);
    }
  });

  // ─── Xóa tin nhắn real-time ─────────────────────────────────────────────────
  socket.on("delete_message", async (data) => {
    try {
      const { messageId, conversationUserId } = data;
      const message = await MessageModel.findById(messageId);
      if (!message) return;

      // Chỉ người gửi hoặc admin mới được xóa
      if (
        message.sender.toString() !== socket.userId &&
        socket.userRole !== "admin"
      )
        return;

      message.isDeleted = true;
      message.content = "";
      message.imageUrl = null;
      await message.save();

      const convUserId = conversationUserId || message.conversationUserId.toString();
      io.to(`user_${convUserId}`).emit("message_deleted", { messageId });
      io.to("admin").emit("message_deleted", { messageId });
    } catch (err) {
      console.error("Socket delete_message error:", err);
    }
  });

  // ─── Sửa tin nhắn real-time ─────────────────────────────────────────────────
  socket.on("edit_message", async (data) => {
    try {
      const { messageId, content, conversationUserId } = data;
      if (!content?.trim()) return;

      const message = await MessageModel.findById(messageId);
      if (!message || message.isDeleted) return;

      // Chỉ người gửi mới được sửa
      if (message.sender.toString() !== socket.userId) return;

      message.content = content.trim();
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      const updated = await MessageModel.findById(messageId)
        .populate("sender", "name avatar role")
        .lean();

      const msgToSend = {
        ...updated,
        _id: updated._id.toString(),
        conversationUserId: updated.conversationUserId.toString(),
        sender: { ...updated.sender, _id: updated.sender._id.toString() },
      };

      const convUserId = conversationUserId || message.conversationUserId.toString();
      io.to(`user_${convUserId}`).emit("message_edited", msgToSend);
      io.to("admin").emit("message_edited", msgToSend);
    } catch (err) {
      console.error("Socket edit_message error:", err);
    }
  });
});

const PORT = process.env.PORT || 3000;

// ─── Express Middlewares ──────────────────────────────────────────────────────
app.use(cors(CorsConfig));
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
app.use(compression());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/v1", async (req, res) => {
  res.send({ message: "API is running" });
});

app.use("/api/v1", v1Router);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    console.log(`🤖 Đang sử dụng Gemma 2 chính chủ từ Google`);
    console.log(`💬 Socket.IO đã sẵn sàng`);
  });
};

startServer();
