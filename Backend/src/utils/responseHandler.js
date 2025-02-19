export const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    err: {},
  });
};

export const errorResponse = (res, statusCode, message, error = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: {},
    err: error,
  });
};
