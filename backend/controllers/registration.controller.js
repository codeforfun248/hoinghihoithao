import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
// Đổi lại import Model cho đúng
import RegistrationModel from "../models/registrations.model.js";
import customError from "../utils/custom-error.js";

const addRegistration = asyncHandler(async (req, res) => {
  const newRegistration = await RegistrationModel.create({
    ...req.body,
    user: req.user.userId, // Đăng ký thì dùng 'user' (ID của người đăng nhập)
  });

  return res.status(200).json({
    data: newRegistration,
    vcode: 0,
    msg: "Đăng ký tham gia thành công",
  });
});

const deleteRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  const deletedRegistration = await RegistrationModel.findByIdAndDelete(id);

  if (!deletedRegistration) {
    throw new customError("Không tìm thấy thông tin đăng ký", 404);
  }

  return res.status(200).json({
    vcode: 0,
    msg: "Xóa đăng ký thành công",
  });
});

const updateRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  const updatedRegistration = await RegistrationModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedRegistration) {
    throw new customError("Không tìm thấy thông tin đăng ký", 404);
  }

  return res.status(200).json({
    data: updatedRegistration,
    vcode: 0,
    msg: "Cập nhật trạng thái đăng ký thành công",
  });
});

const getRegistrations_ByFields = asyncHandler(async (req, res) => {
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

  // 2. Parse an toàn biến `sort` (Áp dụng fix chống lỗi Sort)
  let parsedSort = { _id: -1 };
  if (sort) {
    try {
      const tempSort = JSON.parse(sort);
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

  // 4. Tạo Query object
  let dbQuery = RegistrationModel.find(filter)
    .select("-__v")
    .populate("user", "name email avatar") // Populate thông tin sinh viên
    .populate("conference", "name img start_date end_date location"); // Populate thông tin hội nghị

  dbQuery = dbQuery
    .sort(parsedSort)
    .limit(parsedLimit)
    .skip((parsedPage - 1) * parsedLimit);

  // 5. Thực thi song song query và đếm tổng số
  const [result, total] = await Promise.all([
    dbQuery,
    RegistrationModel.countDocuments(filter),
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

export default {
  addRegistration,
  deleteRegistration,
  updateRegistration,
  getRegistrations_ByFields,
};
