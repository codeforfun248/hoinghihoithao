import customError from "../utils/custom-error.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof customError) {
    return res
      .status(err.statusCode)
      .json({ msg: err.message, vcode: err.vcode });
  }
  return res.status(500).json({
    msg: err.message,
    vcode: 1,
  });
};

export default errorHandler;
