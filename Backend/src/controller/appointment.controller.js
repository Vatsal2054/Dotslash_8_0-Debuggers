import Appointment from "../models/appointment.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
function generateRoomId(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let roomId = "";
  for (let i = 0; i < length; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomId;
}
const createAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, time, notes, type, doctorId } = req.body;

    const doctor = await User.findById(doctorId); // Ensure correct model
    if (!doctor) {
      return res.status(400).json(new ApiError(400, "Doctor not found", false));
    }

    let roomId = null;
    if (type === "online") {
      roomId = generateRoomId();
    }

    const appointment = new Appointment({
      userId,
      doctorId,
      date,
      time,
      notes,
      type,
      ...(roomId && { roomId }), // Add roomId only if it's not null
    });

    await appointment.save();

    return res
      .status(200)
      .json(new ApiResponse(200, appointment, "Appointment created successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};


// Import required models and utilities
import Appointment from '../models/appointment.model.js';
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';

// API Response utility class
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

// API Error utility class
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

const getAllAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build match condition based on user role
    const matchCondition = userRole === "doctor" 
      ? { doctorId: userId }
      : { userId: userId };

    const appointments = await Appointment.aggregate([
      // Match appointments based on user role
      {
        $match: matchCondition
      },
      // Look up user details (patient if doctor is viewing, doctor if patient is viewing)
      {
        $lookup: {
          from: 'users',
          localField: userRole === "doctor" ? 'userId' : 'doctorId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      // Look up doctor's professional details
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: 'userId',
          as: 'professionalDetails'
        }
      },
      // Unwind the arrays
      {
        $unwind: '$userDetails'
      },
      {
        $unwind: {
          path: '$professionalDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      // Sort by date and time
      {
        $sort: {
          date: -1,
          time: -1
        }
      },
      // Format the output
      {
        $project: {
          _id: 1,
          type: 1,
          date: 1,
          time: 1,
          status: 1,
          notes: 1,
          roomId: 1,
          participant: {
            id: '$userDetails._id',
            name: {
              $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName']
            },
            email: '$userDetails.email',
            phone: '$userDetails.phone',
            avatar: '$userDetails.avatar',
            gender: '$userDetails.gender',
            role: '$userDetails.role'
          },
          doctorDetails: {
            degree: '$professionalDetails.degree',
            specialization: '$professionalDetails.specialization',
            experience: '$professionalDetails.experience',
            workingPlace: '$professionalDetails.workingPlace'
          },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    return res.status(200).json(
      new ApiResponse(
        200, 
        appointments,
        appointments.length ? "Appointments retrieved successfully" : "No appointments found"
      )
    );

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, "Error while fetching appointments", error.message)
    );
  }
};

const updateAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const { date, time, notes, type, doctorId } = req.body;

    // Validate if appointment exists and belongs to the user
    const existingAppointment = await Appointment.findOne({
      _id: appointmentId,
      userId
    });

    if (!existingAppointment) {
      return res.status(404).json(
        new ApiError(404, "Appointment not found or unauthorized")
      );
    }

    // Validate if the appointment is not in the past
    if (new Date(`${date} ${time}`) < new Date()) {
      return res.status(400).json(
        new ApiError(400, "Cannot update past appointments")
      );
    }

    // Generate new roomId if type is changed to online
    let updateData = { date, time, notes, type, doctorId };
    if (type === "online" && existingAppointment.type !== "online") {
      updateData.roomId = generateRoomId();
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json(
      new ApiResponse(200, appointment, "Appointment updated successfully")
    );

  } catch (err) {
    return res.status(500).json(
      new ApiError(500, "Error while updating appointment", err.message)
    );
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      userId,
    });
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment deleted successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const approveAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { status: "approved" },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment approved successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const declineAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { status: "cancelled" },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, appointment, "Appointment declined successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

const joinAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      type: "online",
    });
    const roomId = appointment.roomId;
    if (!roomId) {
      return res
        .status(400)
        .json(new ApiError(400, "Room ID not found", false));
    }
    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { roomId }, "Appointment joined successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};

export {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  approveAppointment,
  declineAppointment,
  joinAppointment
};
