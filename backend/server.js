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
import path from "path"; // Thêm dòng này ở đầu file
import { fileURLToPath } from "url";

// Tạo lại biến __dirname cho môi trường ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors(CorsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(compression()); // Nén các phản hồi
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/v1", async (req, res) => {
  res.send({ message: "API is running" });
});

// Routes v1
app.use("/api/v1", v1Router);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
