import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // 1. Bài báo này nộp cho Hội nghị nào?
    conference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
    },
    // 2. Ai là người nộp (Tác giả chính / Corresponding Author)?
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 3. Thông tin cơ bản của bài báo
    title: {
      type: String,
      required: true,
      trim: true,
    },
    abstract: {
      type: String, // Tóm tắt bài báo (rất quan trọng trong NCKH)
      trim: true,
    },
    // 4. File bài báo thực tế (Upload lên Cloudinary, AWS S3, hoặc thư mục local)
    file_url: {
      type: String,
      required: true,
    },
    // 6. Trạng thái duyệt bài của Hội đồng khoa học
    status: {
      type: String,
      enum: [
        "pending", // Mới nộp, chờ kiểm tra
        "under_review", // Đang gửi cho phản biện đánh giá
        "revision_required", // Cần chỉnh sửa lại theo góp ý
        "accepted", // Đã được chấp nhận đăng kỷ yếu
        "rejected", // Bị từ chối
      ],
      default: "pending",
    },
    // (Tùy chọn) Điểm số hoặc nhận xét của hội đồng phản biện
    reviewer_comments: {
      type: String,
    },
  },
  { timestamps: true },
);

// Ngăn 1 user nộp trùng 1 bài (cùng tiêu đề) vào cùng 1 hội nghị nhiều lần
submissionSchema.index(
  { conference: 1, author: 1, title: 1 },
  { unique: true },
);

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
