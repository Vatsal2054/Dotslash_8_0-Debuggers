import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getDoctor = async (req, res) => {
  try {
    // Find all users with role "doctor" and their corresponding doctor details
    const doctors = await User.aggregate([
      {
        $match: { role: "doctor" }
      },
      {
        $lookup: {
          from: "doctors", // Collection name (MongoDB automatically lowercases and pluralizes)
          localField: "_id",
          foreignField: "userId", // Changed to match the Doctor model schema
          as: "doctorInfo"
        }
      },
      {
        $unwind: {
          path: "$doctorInfo",
          preserveNullAndEmptyArrays: false // Changed to false since we want only matched doctors
        }
      },
      {
        $project: {
          password: 0,
          role: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "doctorInfo._id": 0,
          "doctorInfo.userId": 0,
          "doctorInfo.createdAt": 0,
          "doctorInfo.updatedAt": 0,
          "doctorInfo.__v": 0
        }
      },
      {
        $addFields: {
          degree: "$doctorInfo.degree",
          specialization: "$doctorInfo.specialization",
          experience: "$doctorInfo.experience",
          workingPlace: "$doctorInfo.workingPlace",
          isAvailable: "$doctorInfo.isAvailable"
        }
      },
      {
        $project: {
          doctorInfo: 0 // Remove the nested doctorInfo object after flattening
        }
      }
    ]);

    if (!doctors.length) {
      throw new ApiError(404, "No doctors found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));

  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiError(error.statusCode, error.message));
    }
    return res
      .status(500)
      .json(new ApiError(500, "Error fetching doctors", error.message));
  }
};

const getDoctorsInUserCity = async (req, res) => {
    try {
      // Get the current user's id from auth middleware
      const userId = req.user?._id;
  
      if (!userId) {
        throw new ApiError(401, "Unauthorized request");
      }
  
      // First get the current user's city
      const currentUser = await User.findById(userId);
      
      if (!currentUser || !currentUser.address?.city) {
        throw new ApiError(404, "User city information not found");
      }
  
      const userCity = currentUser.address.city;
  
      // Find all doctors in the user's city
      const doctors = await User.aggregate([
        {
          $match: { 
            role: "doctor",
            _id: { $ne: userId }, // Exclude current user if they're a doctor
            "address.city": userCity // Exact match with user's city
          }
        },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "userId",
            as: "doctorInfo"
          }
        },
        {
          $unwind: {
            path: "$doctorInfo",
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $project: {
            password: 0,
            role: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
            "doctorInfo._id": 0,
            "doctorInfo.userId": 0,
            "doctorInfo.createdAt": 0,
            "doctorInfo.updatedAt": 0,
            "doctorInfo.__v": 0
          }
        },
        {
          $addFields: {
            degree: "$doctorInfo.degree",
            specialization: "$doctorInfo.specialization",
            experience: "$doctorInfo.experience",
            workingPlace: "$doctorInfo.workingPlace",
            isAvailable: "$doctorInfo.isAvailable"
          }
        },
        {
          $project: {
            doctorInfo: 0
          }
        },
        {
          $sort: { experience: -1 } // Sort by experience in descending order
        }
      ]);
  
      if (!doctors.length) {
        throw new ApiError(404, `No doctors found in your city (${userCity})`);
      }
      const response = {
        doctors,
        totalDoctors: doctors.length,
        city: userCity
      };
  
      return res
        .status(200)
        .json(new ApiResponse(
          200, 
          response, 
          `Found ${doctors.length} doctors in your city (${userCity})`
        ));
  
    } catch (error) {
      if (error instanceof ApiError) {
        return res
          .status(error.statusCode)
          .json(new ApiError(error.statusCode, error.message));
      }
      return res
        .status(500)
        .json(new ApiError(500, "Error fetching doctors", error.message));
    }
  };

export { getDoctor,getDoctorsInUserCity };