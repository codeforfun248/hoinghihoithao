import cron from "node-cron";
import ConferenceModel from "../models/conferences.model.js";
import { sendMessageToSystemAdmin } from "./telegramBot.js";

// Chạy mỗi phút 1 lần để theo dõi real-time (từng phút)
cron.schedule("* * * * *", async () => {
  try {
    const now = Date.now();

    const confirmedConferences = await ConferenceModel.find({
      status: "confirmed"
    });

    for (const conf of confirmedConferences) {
      if (!conf.start_date || !conf.end_date) continue;

      const msToStart = new Date(conf.start_date).getTime() - now;
      const msToEnd = new Date(conf.end_date).getTime() - now;

      // 1. Nhắc trước tròn 30 phút (từ 29 đến 30 phút)
      if (msToStart > 29 * 60000 && msToStart <= 30 * 60000) {
        sendMessageToSystemAdmin(`⏳ <b>Sắp diễn ra!</b>\n\nHội nghị <b>${conf.name}</b> sẽ bắt đầu trong đúng 30 phút nữa.\nSếp chuẩn bị tinh thần theo dõi nhé!`);
      }

      // 2. Đúng khoảnh khắc BẮT ĐẦU (Độ trễ tối đa 1 phút do bot quét mỗi 60s)
      if (msToStart > -60000 && msToStart <= 0) {
        sendMessageToSystemAdmin(`▶️ <b>BẮT ĐẦU!</b>\n\nHội nghị <b>${conf.name}</b> đã CHÍNH THỨC bắt đầu ngay lúc này!\n📍 Tại: ${conf.location}`);
      }

      // 3. Đúng khoảnh khắc KẾT THÚC
      if (msToEnd > -60000 && msToEnd <= 0) {
        sendMessageToSystemAdmin(`⏹ <b>KẾT THÚC!</b>\n\nHội nghị <b>${conf.name}</b> vừa mới kết thúc an toàn.\nXin gửi lời chúc mừng đến ban tổ chức, sếp có thể xuất báo cáo được rồi.`);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi trong lúc chạy cron job từng phút:", err);
  }
});

export default cron;
