import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import v1Router from "./routes/index.route.js";
import errorHandler from "./middlewares/error-handler.middleware.js";
import CorsConfig from "./config/cors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
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
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    console.log(`🤖 Đang sử dụng Gemma 2 chính chủ từ Google`);
  });
};

startServer();
