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
    // Get user ID from authenticated request
    const userId = req.user._id;
    
    // Find all appointments for this user with populated doctor details
    const appointments = await Appointment.find({ userId })
      .populate({
        path: 'doctorId',
        model: 'User',
        select: 'firstName lastName email phone avatar gender address'
      })
      .populate({
        path: 'doctorId',
        model: 'User',
        // Populate doctor's professional details from Doctor model
        populate: {
          path: 'userId', // This should match the field in Doctor model that references User
          model: 'Doctor',
          select: 'degree specialization experience workingPlace isAvailable'
        }
      })
      .lean();

    // Check if appointments exist
    if (!appointments || appointments.length === 0) {
      throw new ApiError(404, "No appointments found");
    }

    // Transform and format the appointment data
    const formattedAppointments = appointments.map(appointment => {
      const doctorDetails = appointment.doctorId;
      const professionalDetails = doctorDetails?.userId || {};

      return {
        appointmentId: appointment._id,
        type: appointment.type,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        notes: appointment.notes,
        roomId: appointment.roomId,
        doctor: {
          id: doctorDetails?._id,
          firstName: doctorDetails?.firstName,
          lastName: doctorDetails?.lastName,
          email: doctorDetails?.email,
          phone: doctorDetails?.phone,
          avatar: doctorDetails?.avatar,
          gender: doctorDetails?.gender,
          address: doctorDetails?.address,
          degree: professionalDetails?.degree,
          specialization: professionalDetails?.specialization,
          experience: professionalDetails?.experience,
          workingPlace: professionalDetails?.workingPlace,
          isAvailable: professionalDetails?.isAvailable
        },
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      };
    });

    // Send successful response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedAppointments,
          "Appointments retrieved successfully"
        )
      );

  } catch (error) {
    // If error is already an ApiError, send it directly
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(error);
    }

    // Otherwise, send a generic server error
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          "Error while fetching appointments",
          error.message
        )
      );
  }
};

export { getAllAppointments };

const updateAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const { date, time, notes, type, doctorId } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { date, time, notes, type, doctorId },
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
        new ApiResponse(200, appointment, "Appointment updated successfully")
      );
  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
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
