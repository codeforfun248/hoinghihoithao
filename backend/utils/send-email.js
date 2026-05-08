import nodemailer from "nodemailer";

const sendEmail = async ({ email, subject, message }) => {
  // Cấu hình tài khoản Gmail gửi đi (Bạn nên đưa vào file .env)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME, // VD: test@gmail.com
      pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng (App Password) của Gmail
    },
  });

  const mailOptions = {
    from: '"Hệ thống Hội nghị" <no-reply@tdmu.edu.vn>',
    to: email,
    subject: subject,
    html: message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
