import { ApiError } from "./ApiError.js";
const isDoctor = (req, res, next) => {
  if (req.user.role === "doctor") {
    next();
  } else {
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          "Access denied. Only doctors can access this route.",
          false
        )
      );
  }
};
const isPatient = (req, res, next) => {
  if (req.user.role === "patient") {
    next();
  } else {
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          "Access denied. Only patients can access this route.",
          false
        )
      );
  }
};

export { isDoctor, isPatient };
