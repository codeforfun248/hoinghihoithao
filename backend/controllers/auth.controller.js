import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken"; // Import jwt để tạo token
import customError from "../utils/custom-error.js";
import { OAuth2Client } from "google-auth-library";
import UserModel from "../models/users.model.js";
import bcryptjs from "bcryptjs";
import sendEmail from "../utils/send-email.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const findUser = await UserModel.findOne({ email });
  if (findUser) throw new customError("Người dùng đã tồn tại", 401);

  const hashedPassword = await bcryptjs.hash(password, 10);

  await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });

  return res.status(200).json({
    data: {},
    vcode: 0,
    msg: "Đăng ký thành công",
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 2. Kiểm tra email đã tồn tại trong DB chưa
  let user = await UserModel.findOne({ email });
  if (!user) throw new customError("Thông tin đăng nhập không chính xác", 401);

  if (!(await bcryptjs.compare(password, user.password)))
    throw new customError("Thông tin đăng nhập không chính xác", 401);

  // 4. Tạo JWT
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  user.password = undefined;
  user.__v = undefined;

  return res.status(200).json({
    data: user,
    vcode: 0,
    msg: "Đăng nhập thành công",
  });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  // 1. Verify token với Google
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, given_name, family_name, hd } = payload;

  // 2. Kiểm tra email đã tồn tại trong DB chưa
  let user = await UserModel.findOne({ email });
  // Nếu chưa có user thì tạo mới với password random 10 ký tự
  if (!user) {
    // Tạo password ngẫu nhiên 10 ký tự
    const randomPassword = Array(10)
      .fill(0)
      .map(() =>
        String.fromCharCode(
          Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97),
        ),
      )
      .join("");
    const hashedPassword = await bcryptjs.hash(randomPassword, 10);
    user = {
      email,
      avatar: payload.picture,
      name: `${family_name} ${given_name}`,
      role: "user",
      password: hashedPassword,
    };
    // 3. Nếu chưa tồn tại thì tạo mới
    user = await UserModel.create(user);
  }

  // 4. Tạo JWT
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    data: user,
    vcode: 0,
    msg: "Login successful",
  });
});

const fetchMe = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  console.log("userId", userId);

  const user = await UserModel.findById(userId);
  if (!user) throw new customError("User not found", 404);

  return res.status(200).json({
    data: user,
    vcode: 0,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({
    vcode: 0,
    msg: "Đăng xuất thành công",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // 1. Kiểm tra user có tồn tại không
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new customError("Email không tồn tại trong hệ thống", 404);
  }

  // 2. Tạo token khôi phục (Hết hạn trong 15 phút)
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // 3. Tạo link khôi phục (Trỏ về trang Frontend mà bạn sẽ tạo sau)
  // Giả sử frontend của bạn chạy ở cổng 4200
  const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;

  // 4. Nội dung Email
  const message = `
    <h2>Yêu cầu đặt lại mật khẩu</h2>
    <p>Bạn nhận được email này vì đã yêu cầu khôi phục mật khẩu. Vui lòng click vào link bên dưới để đặt lại mật khẩu mới (Link có hiệu lực trong 15 phút):</p>
    <a href="${resetUrl}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Đặt lại mật khẩu</a>
    <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
  `;

  // 5. Gửi mail
  try {
    await sendEmail({
      email: user.email,
      subject: "[TDMU] Khôi phục mật khẩu",
      message,
    });

    res.status(200).json({
      vcode: 0,
      msg: "Đã gửi link khôi phục vào email của bạn",
    });
  } catch (error) {
    console.log(error);
    throw new customError("Có lỗi khi gửi email, vui lòng thử lại sau", 500);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new customError("Dữ liệu không hợp lệ", 400);
  }

  try {
    // 1. Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Tìm User
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new customError("Người dùng không tồn tại", 404);
    }

    // 3. Mã hóa mật khẩu mới (Nếu schema của bạn có sẵn hàm pre('save') hash rồi thì không cần đoạn này, chỉ cần gán user.password = newPassword)
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // 4. Lưu lại
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      vcode: 0,
      msg: "Mật khẩu đã được cập nhật thành công!",
    });
  } catch (error) {
    throw new customError("Link khôi phục đã hết hạn hoặc không hợp lệ", 400);
  }
});

export default {
  register,
  login,
  googleLogin,
  fetchMe,
  logout,
  forgotPassword,
  resetPassword,
};
