class customError extends Error {
  constructor(message, statusCode, vcode = 1) {
    super(message);
    this.statusCode = statusCode;
    this.vcode = vcode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default customError;
