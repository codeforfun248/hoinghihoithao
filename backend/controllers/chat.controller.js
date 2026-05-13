import asyncHandler from "express-async-handler";
import MessageModel from "../models/messages.model.js";
import UserModel from "../models/users.model.js";
import customError from "../utils/custom-error.js";

// Helper: chuẩn hóa message object để frontend dễ xử lý
const normalizeMsg = (msg) => ({
  ...msg,
  _id: msg._id.toString(),
  conversationUserId: msg.conversationUserId.toString(),
  sender: msg.sender
    ? { ...msg.sender, _id: msg.sender._id.toString() }
    : msg.sender,
});

// ─── USER: Lấy lịch sử chat của chính mình với admin ───────────────────────
export const getMyMessages = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const messages = await MessageModel.find({ conversationUserId: userId })
    .sort({ createdAt: 1 })
    .populate("sender", "name avatar role")
    .lean();

  res.json({ vcode: 0, data: messages.map(normalizeMsg) });
});

// ─── ADMIN: Lấy danh sách user đã nhắn tin (inbox) ─────────────────────────
export const getConversationList = asyncHandler(async (req, res) => {
  const conversations = await MessageModel.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversationUserId",
        lastMessage: { $first: "$$ROOT" },
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  // Populate thông tin user
  const populated = await UserModel.populate(conversations, {
    path: "_id",
    select: "name email avatar",
  });

  // Chuẩn hóa IDs
  const result = populated.map((c) => ({
    userId: c._id?._id?.toString() || c._id?.toString(),
    user: c._id
      ? {
          _id: c._id._id?.toString() || c._id.toString(),
          name: c._id.name,
          email: c._id.email,
          avatar: c._id.avatar,
        }
      : null,
    lastMessage: c.lastMessage
      ? {
          ...c.lastMessage,
          _id: c.lastMessage._id.toString(),
          conversationUserId: c.lastMessage.conversationUserId.toString(),
        }
      : null,
  }));

  res.json({ vcode: 0, data: result });
});

// ─── ADMIN: Lấy lịch sử chat của một user cụ thể ───────────────────────────
export const getMessagesByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const messages = await MessageModel.find({ conversationUserId: userId })
    .sort({ createdAt: 1 })
    .populate("sender", "name avatar role")
    .lean();

  res.json({ vcode: 0, data: messages.map(normalizeMsg) });
});

// ─── Xóa tin nhắn (soft delete) ─────────────────────────────────────────────
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const message = await MessageModel.findById(messageId);
  if (!message) throw new customError("Tin nhắn không tồn tại", 404);

  if (message.sender.toString() !== userId && userRole !== "admin") {
    throw new customError("Bạn không có quyền xóa tin nhắn này", 403);
  }

  message.isDeleted = true;
  message.content = "";
  message.imageUrl = null;
  await message.save();

  res.json({ vcode: 0, msg: "Đã xóa tin nhắn" });
});

// ─── Sửa tin nhắn ────────────────────────────────────────────────────────────
export const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content || !content.trim()) {
    throw new customError("Nội dung không được để trống", 400);
  }

  const message = await MessageModel.findById(messageId);
  if (!message) throw new customError("Tin nhắn không tồn tại", 404);
  if (message.isDeleted) throw new customError("Không thể sửa tin nhắn đã xóa", 400);
  if (message.sender.toString() !== userId) {
    throw new customError("Bạn không có quyền sửa tin nhắn này", 403);
  }

  message.content = content.trim();
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  const updated = await MessageModel.findById(messageId)
    .populate("sender", "name avatar role")
    .lean();

  res.json({ vcode: 0, msg: "Đã cập nhật tin nhắn", data: normalizeMsg(updated) });
});
