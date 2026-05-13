# 💬 Hệ thống Chat CSKH Real-time

## 📋 Tổng quan

Hệ thống chat real-time giữa User và Admin với các tính năng:
- ✅ User nhắn tin cho Admin (cần đăng nhập)
- ✅ Admin trả lời từ trang quản lý
- ✅ Gửi hình ảnh < 10MB
- ✅ Sửa/xóa tin nhắn với note "đã chỉnh sửa"
- ✅ Thông báo Telegram khi user nhắn tin
- ✅ Lịch sử tự động xóa sau 3 ngày
- ✅ Real-time với Socket.IO

---

## 🚀 Cài đặt

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## ⚙️ Cấu hình

### 1. Telegram Bot (Thông báo cho Admin)

Đã có sẵn trong `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_CHAT_ID=your_chat_id
```

Nếu chưa có, làm theo hướng dẫn trong `backend/utils/telegramBot.js`

### 2. MongoDB TTL Index

Tin nhắn tự động xóa sau 3 ngày nhờ TTL index trong model `messages.model.js`:
```javascript
expireAt: {
  type: Date,
  default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
}
```

MongoDB sẽ tự động xóa document khi `expireAt` đến.

---

## 📂 Cấu trúc Files

### Backend
```
backend/
├── models/
│   └── messages.model.js          # Model tin nhắn
├── controllers/
│   └── chat.controller.js         # Logic xử lý chat
├── routes/
│   └── chat.route.js              # API routes
├── server.js                      # Socket.IO setup
└── utils/
    └── telegramBot.js             # Gửi thông báo Telegram
```

### Frontend
```
frontend/src/
├── services/
│   └── chat.service.ts            # Socket.IO client + API calls
├── components/
│   └── cskh-widget/               # Widget CSKH góc phải (User)
│       ├── cskh-widget.component.ts
│       ├── cskh-widget.component.html
│       └── cskh-widget.component.css
└── admin/
    └── chat/                      # Trang chat admin
        ├── admin-chat.component.ts
        ├── admin-chat.component.html
        └── admin-chat.component.css
```

---

## 🎯 Cách sử dụng

### User (Trang chủ)
1. Nhấn nút **CSKH** góc phải màn hình
2. Đăng nhập nếu chưa đăng nhập
3. Nhắn tin hoặc gửi hình ảnh
4. Có thể sửa/xóa tin nhắn của mình

### Admin (Trang quản lý)
1. Vào `/admin/chat` từ sidebar "Hỗ trợ CSKH"
2. Chọn user từ danh sách bên trái
3. Xem lịch sử và trả lời tin nhắn
4. Nhận thông báo Telegram khi user nhắn tin

---

## 🔧 API Endpoints

### User
- `GET /api/v1/chat/my-messages` - Lấy lịch sử chat của mình

### Admin
- `GET /api/v1/chat/conversations` - Danh sách inbox
- `GET /api/v1/chat/conversations/:userId` - Lịch sử chat với user

### Shared
- `DELETE /api/v1/chat/:messageId` - Xóa tin nhắn
- `PUT /api/v1/chat/:messageId` - Sửa tin nhắn

### Socket.IO Events
- `send_message` - Gửi tin nhắn
- `delete_message` - Xóa tin nhắn
- `edit_message` - Sửa tin nhắn
- `new_message` - Nhận tin nhắn mới
- `message_deleted` - Tin nhắn bị xóa
- `message_edited` - Tin nhắn được sửa

---

## 🎨 Giao diện

### User Widget
- Nút FAB góc phải với label "CSKH"
- Khung chat 360x520px
- Hỗ trợ gửi text + hình ảnh
- Hiển thị "đã chỉnh sửa" khi tin nhắn được sửa

### Admin Dashboard
- Layout 2 cột: Inbox (trái) + Chat (phải)
- Danh sách user đã nhắn tin
- Xem lịch sử đầy đủ
- Trả lời real-time

---

## 🔐 Bảo mật

- ✅ Xác thực JWT qua cookie
- ✅ Socket.IO middleware kiểm tra token
- ✅ User chỉ xem/sửa/xóa tin của mình
- ✅ Admin có quyền xóa mọi tin nhắn
- ✅ Upload hình ảnh giới hạn 10MB

---

## 🐛 Troubleshooting

### Socket không kết nối
- Kiểm tra CORS trong `backend/config/cors.js`
- Đảm bảo cookie được gửi (`withCredentials: true`)

### Telegram không gửi thông báo
- Kiểm tra `TELEGRAM_BOT_TOKEN` và `ADMIN_CHAT_ID` trong `.env`
- Chạy `node backend/getChatId.js` để lấy chat ID

### Tin nhắn không tự xóa sau 3 ngày
- MongoDB phải hỗ trợ TTL index
- Kiểm tra index: `db.messages.getIndexes()`

---

## 📝 Lưu ý

1. **Lịch sử 3 ngày**: MongoDB tự động xóa, không cần cron job
2. **Thông báo Telegram**: Chỉ gửi khi user nhắn, không gửi khi admin trả lời
3. **Real-time**: Cả user và admin đều nhận tin nhắn ngay lập tức
4. **Hình ảnh**: Lưu trong `backend/uploads/chat/`

---

## 🚀 Chạy ứng dụng

### Development
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Production
```bash
# Build frontend
cd frontend
npm run build

# Chạy backend
cd backend
NODE_ENV=production npm start
```

---

## 📞 Hỗ trợ

Nếu có vấn đề, kiểm tra:
1. Console log trên browser (F12)
2. Terminal backend (xem Socket.IO logs)
3. MongoDB connection
4. Telegram bot status

---

**Hoàn thành! 🎉**
