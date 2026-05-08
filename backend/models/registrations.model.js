import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    conference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conference",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "checked_in", "canceled"],
      default: "registered",
    },
  },
  { timestamps: true },
);

// Ngăn 1 user đăng ký 1 hội nghị 2 lần
registrationSchema.index({ conference: 1, user: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
