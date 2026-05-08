import mongoose from "mongoose";

const conferenceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["conference", "event"],
      required: true,
    },
    author: {
      // người tạo hội nghị
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      // đã được duyệt chưa
      type: String,
      enum: ["pending", "confirmed", "canceled"],
      default: "pending",
    },
    faculty: {
      // Khoa/Viện
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    start_date: {
      // ngày bắt đầu ngày kết thúc
      type: Date,
      required: true,
    },
    end_date: {
      // ngày bắt đầu ngày kết thúc
      type: Date,
      required: true,
    },
    submission_deadline: {
      // hạn nộp bài nếu type là hội nghị(conference)
      type: Date,
    },
    registration_deadline: {
      // hạn đăng ký tham dự
      type: Date,
      required: true,
    },
    max_participants: {
      type: Number,
      required: true,
    },
    current_participants: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: true,
    },
    map: {
      // lưu địa chỉ gg map
      type: String,
    },
    desc: {
      type: String,
    },
    desc_detail: {
      type: String,
    },
    img: {
      type: String,
    },
    sessions: [
      {
        name: {
          type: String,
          required: true,
        },
        start_time: {
          type: Date,
          required: true,
        },
        end_time: {
          type: Date,
          required: true,
        },
        desc: {
          type: String,
        },
      },
    ],
    sponsors: [
      {
        name: {
          type: String,
          required: true,
        },
        logo: {
          type: String,
        },
        link: {
          type: String,
        },
      },
    ],
    speakers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Tên Model của bảng users
          required: true,
        },
        position: {
          type: String,
        },
        desc: {
          type: String,
        },
      },
    ],
    committees: [
      {
        name: {
          type: String,
          required: true,
        },
        members: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User", // Model của bảng users
              required: true,
            },
            position: {
              type: String,
              required: true, // Chức vụ của thành viên trong ban tổ chức
            },
          },
        ],
      },
    ],
    documents: [
      {
        name: {
          type: String, // Ví dụ: "Template bài báo cáo IEEE"
          required: true,
        },
        url: {
          type: String, // Link file tải lên Cloud (S3, Cloudinary, Drive...)
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const Conference = mongoose.model("Conference", conferenceSchema);

export default Conference;
