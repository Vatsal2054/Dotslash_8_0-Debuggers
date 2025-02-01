import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getDoctor = async (req, res) => {
    try {
      // Find all users with role "doctor"
      const doctors = await User.aggregate([
        {
          // Match only users with doctor role
          $match: { 
            role: "doctor" 
          }
        },
        {
          // Left join with Doctor model
          $lookup: {
            from: "doctors", // Collection name (mongoose automatically lowercases and pluralizes)
            localField: "_id",
            foreignField: "user",
            as: "doctorInfo"
          }
        },
        {
          // Unwind the doctorInfo array
          $unwind: "$doctorInfo"
        },
        {
          // Project only needed fields
          $project: {
            password: 0, // Exclude password
            _id: 1,
            firstName: 1,
            lastName: 1,
            email: 1,
            phone: 1,
            address: 1,
            gender: 1,
            avatar: 1,
            degree: "$doctorInfo.degree",
            specialization: "$doctorInfo.specialization",
            experience: "$doctorInfo.experience",
            workingPlace: "$doctorInfo.workingPlace",
            isAvailable: "$doctorInfo.isAvailable"
          }
        }
      ]);
  
      if (!doctors.length) {
        return res
          .status(404)
          .json(new ApiError(404, "No doctors found"));
      }
  
      return res
        .status(200)
        .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
  
    } catch (error) {
      return res
        .status(500)
        .json(new ApiError(500, "Error fetching doctors", error.message));
    }
  };
  
  export { getDoctor };