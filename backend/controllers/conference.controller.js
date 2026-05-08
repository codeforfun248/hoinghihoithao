import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import ConferenceModel from "../models/conferences.model.js";
import customError from "../utils/custom-error.js";
import RegistrationModel from "../models/registrations.model.js";
import { sendMessageToSystemAdmin } from "../utils/telegramBot.js";

const addConference = asyncHandler(async (req, res) => {
  const newConference = await ConferenceModel.create({
    ...req.body,
    author: req.user.userId,
  });

  sendMessageToSystemAdmin(`🔥 <b>HỆ THỐNG: Yêu cầu duyệt Hội Nghị</b>\nĐã có người nộp một sự kiện mới:\n📌 Tên: <b>${newConference.name}</b>\n📍 Địa điểm: ${newConference.location}`);

  return res.status(200).json({
    data: newConference,
    vcode: 0,
    msg: "Tạo hội nghị thành công",
  });
});

const deleteConference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  await ConferenceModel.findByIdAndDelete(id);
  return res.status(200).json({
    vcode: 0,
    msg: "Xóa hội nghị thành công",
  });
});

const updateConference = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  // Lấy dữ liệu cũ để check thay đổi trạng thái
  const oldConference = await ConferenceModel.findById(id);

  // Xóa _id từ committees trước khi update để tránh lỗi CastError
  const updateData = { ...req.body };
  if (updateData.committees && Array.isArray(updateData.committees)) {
    updateData.committees = updateData.committees.map((committee) => {
      const { _id, ...rest } = committee;
      return rest;
    });
  }

  if (updateData.sessions && Array.isArray(updateData.sessions)) {
    updateData.sessions = updateData.sessions.map((committee) => {
      const { _id, ...rest } = committee;
      return rest;
    });
  }

  if (updateData.speakers && Array.isArray(updateData.speakers)) {
    updateData.speakers = updateData.speakers.map((committee) => {
      const { _id, ...rest } = committee;
      return rest;
    });
  }

  if (updateData.sponsors && Array.isArray(updateData.sponsors)) {
    updateData.sponsors = updateData.sponsors.map((committee) => {
      const { _id, ...rest } = committee;
      return rest;
    });
  }

  // Cập nhật và trả về dữ liệu mới nhất (new: true)
  const updatedConference = await ConferenceModel.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedConference) {
    throw new customError("Không tìm thấy hội nghị", 404);
  }

  return res.status(200).json({
    data: updatedConference,
    vcode: 0,
    msg: "Cập nhật hội nghị thành công",
  });
});

const getConferences_ByFields = asyncHandler(async (req, res) => {
  let { query, sort, limit, page } = req.query;

  // 1. Parse an toàn biến `query`
  let filter = {};
  if (query) {
    try {
      filter = JSON.parse(query);
    } catch (e) {
      throw new customError("Tham số query không hợp lệ", 400);
    }
  }

  // 2. Parse an toàn biến `sort`
  // Sửa lại thành _id: -1 (Chuẩn của Mongoose để lấy mới nhất lên đầu)
  let parsedSort = { _id: -1 };
  if (sort) {
    try {
      const tempSort = JSON.parse(sort);
      // Chỉ nhận sort nếu object không rỗng
      if (Object.keys(tempSort).length > 0) {
        parsedSort = tempSort;
      }
    } catch (e) {
      throw new customError("Tham số sort không hợp lệ", 400);
    }
  }

  // 3. Ép kiểu phân trang an toàn
  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;

  // 4. Tạo Query object (KHÔNG có await)
  let dbQuery = ConferenceModel.find(filter)
    .select("-__v")
    .populate("author", "name email avatar")
    .populate("faculty", "name")
    .populate({
      path: "speakers.user",
      select: "name email avatar role academic_degree",
    })
    .populate({
      path: "committees.members.user",
      select: "name email avatar role academic_degree",
    });

  // Truyền parsedSort vào hàm sort của mongoose
  dbQuery = dbQuery
    .sort(parsedSort)
    .limit(parsedLimit)
    .skip((parsedPage - 1) * parsedLimit);

  // 5. Thực thi song song query và đếm tổng số
  const [result, total] = await Promise.all([
    dbQuery,
    ConferenceModel.countDocuments(filter),
  ]);

  return res.status(200).json({
    vcode: 0,
    data: result,
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPage: Math.ceil(total / parsedLimit),
  });
});

const registerParticipate = asyncHandler(async (req, res) => {
  // Lấy ID hội nghị từ body và ID user từ token đăng nhập
  const { conferenceId } = req.body;
  const userId = req.user.userId;

  const conference = await ConferenceModel.findById(conferenceId);
  if (!conference) throw new customError("Không tìm thấy hội nghị", 404);

  // Tìm xem user này đã từng thao tác với hội nghị này chưa
  let registration = await RegistrationModel.findOne({
    conference: conferenceId,
    user: userId,
  });

  if (registration) {
    // --- NẾU ĐÃ TỪNG ĐĂNG KÝ TRƯỚC ĐÓ ---
    if (registration.status === "registered") {
      // 1. Nếu đang Đăng ký -> Chuyển thành Hủy
      registration.status = "canceled";
      await registration.save();
      await ConferenceModel.findByIdAndUpdate(conferenceId, {
        $inc: { current_participants: -1 },
      });

      return res.status(200).json({
        data: { status: "canceled" },
        vcode: 0,
        msg: "Đã hủy đăng ký thành công",
      });
    } else if (registration.status === "canceled") {
      // 2. Nếu đang Hủy -> Chuyển thành Đăng ký lại
      if (conference.current_participants >= conference.max_participants) {
        throw new customError("Hội nghị đã đủ số lượng người tham gia", 400);
      }
      registration.status = "registered";
      await registration.save();
      await ConferenceModel.findByIdAndUpdate(conferenceId, {
        $inc: { current_participants: 1 },
      });

      return res.status(200).json({
        data: { status: "registered" },
        vcode: 0,
        msg: "Đăng ký tham gia thành công",
      });
    } else if (registration.status === "checked_in") {
      // 3. Đã tham gia thực tế (quét QR) -> Không cho hủy
      throw new customError(
        "Bạn đã điểm danh tham gia hội nghị này rồi, không thể thao tác.",
        400,
      );
    }
  } else {
    // --- NẾU ĐĂNG KÝ LẦN ĐẦU TIÊN ---
    if (conference.current_participants >= conference.max_participants) {
      throw new customError("Hội nghị đã đủ số lượng người tham gia", 400);
    }

    await RegistrationModel.create({
      conference: conferenceId,
      user: userId,
      status: "registered",
    });

    await ConferenceModel.findByIdAndUpdate(conferenceId, {
      $inc: { current_participants: 1 },
    });

    return res.status(200).json({
      data: { status: "registered" },
      vcode: 0,
      msg: "Đăng ký tham gia thành công",
    });
  }
});

const checkRegistration = asyncHandler(async (req, res) => {
  const { conferenceId } = req.body;
  const userId = req.user.userId; // (Hoặc req.user._id tùy cách bạn setup middleware auth)

  // Tìm kiếm thông tin đăng ký trong Database
  const registration = await RegistrationModel.findOne({
    conference: conferenceId,
    user: userId,
  });

  // Nếu không tìm thấy -> Chưa từng đăng ký
  if (!registration) {
    return res.status(200).json({
      data: { status: null },
      vcode: 0,
      msg: "Người dùng chưa đăng ký",
    });
  }

  // Nếu tìm thấy -> Trả về trạng thái hiện tại (registered, canceled, checked_in)
  return res.status(200).json({
    data: { status: registration.status },
    vcode: 0,
    msg: "Lấy trạng thái thành công",
  });
});
export default {
  addConference,
  deleteConference,
  updateConference,
  getConferences_ByFields,
  registerParticipate,
  checkRegistration,
};
