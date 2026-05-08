import dotenv from "dotenv";
dotenv.config();
import TelegramBot from "node-telegram-bot-api";

// Lấy token từ môi trường
const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID; // Bắt buộc phải có mã Chat ID của riêng bạn!

let bot = null;

if (token) {
  bot = new TelegramBot(token, { polling: true });
  console.log("🚀 Lõi System Admin Bot đang chạy...");

  // Handler tạm thời để bạn lấy mã Chat ID khi bạn nhắn tin cho bot
  bot.on('message', (msg) => {
    console.log(`\n===========================================`);
    console.log(`NHẬN DIỆN ĐƯỢC ADMIN!`);
    console.log(`HÃY COPY DÒNG NÀY DÁN VÀO FILE .env:`);
    console.log(`ADMIN_CHAT_ID="${msg.chat.id}"`);
    console.log(`===========================================\n`);
    bot.sendMessage(msg.chat.id, `Mã Chat ID của bạn là: ${msg.chat.id}. Hãy làm theo hướng dẫn của AI để khóa mã này vào hệ thống nhé!`);
  });

  if (!adminChatId) {
    console.log("⚠️ CHÚ Ý: Hệ thống chưa có ADMIN_CHAT_ID. Hãy nhắn tin cho bot để lấy mã.");
  }
}

/**
 * Gửi tin nhắn duy nhất tới Lãnh đạo hệ thống (Bạn)
 */
export const sendMessageToSystemAdmin = async (message) => {
  if (!bot || !process.env.ADMIN_CHAT_ID) return;

  try {
    bot.sendMessage(process.env.ADMIN_CHAT_ID, message, { parse_mode: "HTML" }).catch(err => console.error("Lỗi gửi Telegram:", err));
  } catch (error) {
    console.error("Lỗi:", error);
  }
};

export default bot;
