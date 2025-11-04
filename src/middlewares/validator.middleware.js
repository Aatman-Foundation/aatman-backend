import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];

  errors.array().map((err) =>
    extractedErrors.push({
      [err.path]: err.msg,
    }),
  );
  console.log("error are", extractedErrors)
  throw new ApiError(422, "Recieved data is not valid", extractedErrors);
};
