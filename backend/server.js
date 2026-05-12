import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import thư viện Google mới
import v1Router from "./routes/index.route.js";
import errorHandler from "./middlewares/error-handler.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CẤU HÌNH GOOGLE AI (GEMMA 2)
// ==========================================
// Bạn có thể để Key trong .env hoặc dán trực tiếp vào đây để test nhanh
//const genAI = new GoogleGenerativeAI("AIzaSyCJ1XVDjo0OUsCuNdyfHC3vOd5dA1OUm44"); // <--- Thay bằng Google API Key của bạn

// Middlewares
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(morgan("dev"));
app.use(compression());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// API CHAT AI (SỬ DỤNG GEMMA 2 CHÍNH CHỦ)
// ==========================================
app.post("/api/v1/chat-ai", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Nội dung trống" });

    const API_KEY = "GEMINI_API_KEY"; // Đảm bảo key này bạn vừa lấy từ Google AI Studio

    // URL này sử dụng model định danh chính xác nhất hiện nay
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `Bạn là trợ lý ảo chuyên nghiệp. Hãy trả lời bằng tiếng Việt: ${message}` }]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      res.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      // Nếu vẫn lỗi, đoạn này sẽ in ra để ta biết chính xác Google muốn gì
      console.log("Cấu trúc phản hồi đầy đủ:", JSON.stringify(data, null, 2));
      res.json({ reply: "AI đang bảo trì hệ thống, thử lại sau nhé!" });
    }
  } catch (error) {
    console.error("Lỗi:", error);
    res.json({ reply: "Không thể kết nối với trí tuệ nhân tạo." });
  }
});

app.get("/api/v1", async (req, res) => {
  res.send({ message: "API is running" });
});

app.use("/api/v1", v1Router);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    console.log(`🤖 Đang sử dụng Gemma 2 chính chủ từ Google`);
  });
};

startServer();