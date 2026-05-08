import asyncHandler from "express-async-handler";
import customError from "../utils/custom-error.js";
import UserModel from "../models/users.model.js";
import FacultyModel from "../models/faculties.model.js";
import ConferenceModel from "../models/conferences.model.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

const addUser = asyncHandler(async (req, res) => {
  const { name, email, password, academic_degree, avatar } = req.body;

  if (!name || !email || !academic_degree || !password) {
    throw new customError("Vui lòng điền đầy đủ thông tin", 401);
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new customError("Người dùng đã tồn tại", 401);
  }
  const hashedPassword = await bcryptjs.hash(password, 10);

  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    academic_degree,
    avatar,
  });

  console.log("newUser", newUser);

  return res.status(201).json({
    vcode: 0,
    data: {
      _id: newUser._id,
      name,
      email,
      academic_degree,
      avatar,
      role: newUser.role,
    },
    msg: "Thêm người dùng thành công",
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }
  const { name, email, role, academic_degree, avatar, password } = req.body;

  const user = await UserModel.findById(id);
  if (!user) {
    throw new customError("Không tìm thấy người dùng", 404);
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (avatar) user.avatar = avatar;
  if (academic_degree) user.academic_degree = academic_degree;
  if (password) {
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
  }

  await user.save();
  return res.status(200).json({
    vcode: 0,
    msg: "Cập nhật người dùng thành công",
    data: user,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  await UserModel.findByIdAndDelete(id);
  return res.status(200).json({
    vcode: 0,
    msg: "Xóa người dùng thành công",
  });
});

const getUsers_ByFields = asyncHandler(async (req, res) => {
  let { query, sort, limit, page } = req.query;

  // Bỏ bắt buộc truyền limit và page
  if (!query || !sort) {
    throw new customError("Missing query or sort parameters", 400);
  }

  const filter = JSON.parse(query);
  const sortObj = JSON.parse(sort);

  // 1. Tạo Query object
  let dbQuery = UserModel.find(filter).select("-password -__v").sort(sortObj);

  let parsedLimit = null;
  let parsedPage = null;

  // Chỉ áp dụng phân trang nếu có truyền limit
  if (limit) {
    parsedLimit = parseInt(limit, 10);
    parsedPage = parseInt(page, 10) || 1;
    dbQuery = dbQuery.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
  }

  // 2. Thực thi song song
  const [result, total] = await Promise.all([
    dbQuery,
    UserModel.countDocuments(filter),
  ]);

  return res.status(200).json({
    vcode: 0,
    data: result,
    page: parsedPage || 1,
    limit: parsedLimit || total, // Nếu không truyền limit, limit = tổng số
    total,
    totalPage: parsedLimit ? Math.ceil(total / parsedLimit) : 1, // Trả về 1 trang nếu lấy hết
  });
});

//  Faculty
const addFaculty = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new customError("Vui lòng nhập đầy đủ thông tin", 401);
  }

  const newFaculty = await FacultyModel.create({ name });

  return res.status(201).json({
    vcode: 0,
    msg: "Thêm Khoa/Viện thành công",
    data: {
      name: newFaculty.name,
      _id: newFaculty._id,
    },
  });
});

const updateFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }
  const { name } = req.body;

  const faculty = await FacultyModel.findById(id);
  if (!faculty) {
    throw new customError("Không tìm thấy Khoa/Viện", 404);
  }

  if (name) faculty.name = name;

  await faculty.save();
  return res.status(200).json({
    vcode: 0,
    msg: "Cập nhật Khoa/Viện thành công",
    data: {},
  });
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError("ID không hợp lệ", 400);
  }

  await FacultyModel.findByIdAndDelete(id);
  return res.status(200).json({
    vcode: 0,
    msg: "Xóa Khoa/Viện thành công",
  });
});

const getFaculties_ByFields = asyncHandler(async (req, res) => {
  let { query, sort, limit, page } = req.query;

  if (!query || !sort || !limit || !page) {
    throw new customError("Missing query parameters", 400);
  }

  query = query ? JSON.parse(query) : {};
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  sort = sort ? JSON.parse(sort) : { id: "ASC" };

  // Ép kiểu dữ liệu
  const parsedLimit = parseInt(limit, 10);
  const parsedPage = parseInt(page, 10);

  // Lưu ý: Đảm bảo biến 'query' được client gửi lên là một object hợp lệ
  // Nếu client gửi JSON string, bạn cần thêm: const filter = JSON.parse(query);
  const filter = query;

  // 1. Tạo Query object (KHÔNG có await)
  let dbQuery = FacultyModel.find(filter).select("-__v");

  if (sort) dbQuery = dbQuery.sort(sort);
  if (limit) dbQuery = dbQuery.limit(parsedLimit);
  if (page) dbQuery = dbQuery.skip((parsedPage - 1) * parsedLimit);

  // 2. Thực thi song song query và đếm tổng số
  const [result, total] = await Promise.all([
    dbQuery,
    FacultyModel.countDocuments(filter),
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

const getDashboardStats = asyncHandler(async (req, res) => {
  // Chạy song song 3 câu lệnh đếm để tối ưu thời gian
  const [totalConferences, totalUsers, totalFaculties] = await Promise.all([
    ConferenceModel.countDocuments(),
    UserModel.countDocuments(),
    FacultyModel.countDocuments(),
  ]);

  return res.status(200).json({
    vcode: 0,
    data: {
      total_conferences: totalConferences,
      total_uers: totalUsers,
      total_faculties: totalFaculties,
    },
  });
});

export default {
  getUsers_ByFields,
  addUser,
  updateUser,
  deleteUser,

  getFaculties_ByFields,
  addFaculty,
  updateFaculty,
  deleteFaculty,

  getDashboardStats,
};
