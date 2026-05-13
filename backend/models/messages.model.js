import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // "user" | "admin"
    senderRole: {
      type: String,
      enum: ["user", "admin", "organizer"],
      required: true,
    },
    // Tin nhắn thuộc về user nào (để nhóm cuộc hội thoại)
    conversationUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    // Đường dẫn ảnh nếu có
    imageUrl: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    // Tự động xóa sau 3 ngày (TTL index)
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB tự xóa document khi expireAt đến
messageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
