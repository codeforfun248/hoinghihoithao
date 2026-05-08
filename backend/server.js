import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import CorsConfig from "./config/cors.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import v1Router from "./routes/index.route.js";
import errorHandler from "./middlewares/error-handler.middleware.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
//import "./utils/telegramBot.js";
import "./utils/cronJobs.js";
import Groq from "groq-sdk";

// Tạo lại biến __dirname cho môi trường ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Khởi tạo Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middlewares
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(compression()); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// 1. API CHAT AI (SỬ DỤNG GEMMA 2 & TIẾNG VIỆT)
// ==========================================
app.post("/api/v1/chat-ai", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Nội dung trống" });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Bạn là một trợ lý ảo hữu ích. Bạn CHỈ được phép trả lời bằng tiếng Việt chân thực và tự nhiên." 
        },
        { role: "user", content: message }
      ],
      // Đã cập nhật sang model Gemma 2 theo ý bạn
     model: "llama-3.1-8b-instant",
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    res.json({ reply: text });

  } catch (error) {
    console.error("Lỗi AI Chi tiết:", error);
    res.json({ reply: "Gemma đang bận một chút, bạn thử lại nhé!" });
  }
});

// ==========================================
// 2. CÁC ROUTER CHÍNH CỦA HỆ THỐNG
// ==========================================
app.get("/api/v1", async (req, res) => {
  res.send({ message: "API is running" });
});

// Routes v1
app.use("/api/v1", v1Router);

// Error handler LUÔN LUÔN PHẢI ĐẶT CUỐI CÙNG
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🤖 AI Model: Gemma 2 is ready!`);
  });
};

startServer();