import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
// Nhớ import đúng file model Submission của bạn
import SubmissionModel from "../models/submissions.model.js";
import customError from "../utils/custom-error.js";

const addSubmission = asyncHandler(async (req, res) => {
  // Tạo tài liệu/bài báo cáo mới
  const newSubmission = await SubmissionModel.create({
    ...req.body,
    author: req.user.userId, // ID của user đang đăng nhập
  });

  return res.status(200).json({
    data: newSubmission,
    vcode: 0,
    msg: "Nộp tài liệu/báo cáo thành công",
  });
});

const deleteSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  const deletedSubmission = await SubmissionModel.findByIdAndDelete(id);

  if (!deletedSubmission) {
    throw new customError("Không tìm thấy tài liệu này", 404);
  }

  return res.status(200).json({
    vcode: 0,
    msg: "Xóa tài liệu thành công",
  });
});

const updateSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  // Cập nhật và trả về dữ liệu mới nhất (new: true)
  const updatedSubmission = await SubmissionModel.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedSubmission) {
    throw new customError("Không tìm thấy tài liệu", 404);
  }

  return res.status(200).json({
    data: updatedSubmission,
    vcode: 0,
    msg: "Cập nhật tài liệu thành công",
  });
});

const getSubmissions_ByFields = asyncHandler(async (req, res) => {
  let { query, sort, limit, page } = req.query;

  // Xử lý Parse an toàn cho query và sort
  let parsedQuery = {};
  let parsedSort = { createdAt: -1 }; // Mặc định sắp xếp mới nhất lên đầu

  if (query) {
    try {
      parsedQuery = JSON.parse(query);
    } catch (e) {
      parsedQuery = query;
    }
  }

  if (sort) {
    try {
      parsedSort = JSON.parse(sort);
    } catch (e) {
      parsedSort = sort;
    }
  }

  // Ép kiểu phân trang
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  // 1. Tạo Query object
  let dbQuery = SubmissionModel.find(parsedQuery)
    .select("-__v")
    // Lấy thông tin người nộp bài (Tác giả)
    .populate("author", "name email avatar")
    // Lấy thông tin hội nghị mà bài này nộp vào (Tên, ngày tháng...)
    .populate("conference", "name start_date end_date location");

  if (parsedSort) dbQuery = dbQuery.sort(parsedSort);
  if (parsedLimit) dbQuery = dbQuery.limit(parsedLimit);
  if (parsedPage) dbQuery = dbQuery.skip((parsedPage - 1) * parsedLimit);

  // 2. Thực thi song song query và đếm tổng số
  const [result, total] = await Promise.all([
    dbQuery,
    SubmissionModel.countDocuments(parsedQuery),
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
  addSubmission,
  deleteSubmission,
  updateSubmission,
  getSubmissions_ByFields,
};
