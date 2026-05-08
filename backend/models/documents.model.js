import mongoose from "mongoose";

const documentsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tên Model của bảng users
      required: true,
    },
  },
  { timestamps: true },
);

const Documents = mongoose.model("Documents", documentsSchema);

export default Documents;
