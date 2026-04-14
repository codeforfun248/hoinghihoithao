import customError from "../utils/custom-error.js";
import asyncHandler from "express-async-handler";

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new customError("No file uploaded", 400);
  }

  res.status(200).json({
    vcode: 0,
    msg: "Tải lên thành công!",
    data: `${process.env.URL_BACKEND}/uploads/${req.body.folder}/${req.file.filename}`,
  });
});

export default {
  uploadFile,
};
