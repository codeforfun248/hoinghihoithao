import fetch from "node-fetch"; // Node 18+ has native fetch, but we can just use HTTP module or axios if available. Or just use node-telegram-bot-api
import TelegramBot from "node-telegram-bot-api";
const token = "8120223099:AAHpMQzBDGfmuKHuo32z3LUo14z2uJm_w6Y";
const bot = new TelegramBot(token, { polling: false });

async function getUpdates() {
  try {
    const updates = await bot.getUpdates({ limit: 10 });
    console.log("== Danh sách tin nhắn gần đây gửi đến Bot ==");
    if (updates.length === 0) {
      console.log("Chưa có tin nhắn nào. Bạn hãy mở bot trên Telegram và gõ 'hello' rồi chạy lại script này.");
    }
    updates.forEach(u => {
      if (u.message) {
        console.log(`- Người gửi: ${u.message.from.first_name} | Chat ID: ${u.message.chat.id} | Nội dung: ${u.message.text}`);
      }
    });
  } catch(e) {
    console.error(e);
  }
}
getUpdates();
