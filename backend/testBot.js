import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import ConferenceModel from "./models/conferences.model.js";

async function check() {
  await connectDB();
  const latest = await ConferenceModel.findOne().sort({ createdAt: -1 });
  if (latest) {
    console.log(`Hội nghị mới nhất: [${latest.name}] được tạo lúc: ${latest.createdAt}`);
  } else {
    console.log("Không có hội nghị nào trong DB.");
  }
  process.exit(0);
}
check();
