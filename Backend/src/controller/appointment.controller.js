import Appointment from "../models/appointment.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Doctor from '../models/doctor.model.js';
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

const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Find appointment and populate user and doctor details
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json(new ApiError(404, "Appointment not found", false));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, appointment, "Appointment fetched successfully"));

  } catch (err) {
    return res.status(500).json(new ApiError(500, "Server Error", err.message));
  }
};
// Import required models and utilities
const getAllAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all appointments for the user
    const appointments = await Appointment.find({ userId: userId });

    if (!appointments.length) {
      return res.status(404).json({
        success: false,
        message: "No appointments found"
      });
    }

    // Get all appointment details with user and doctor info
    const appointmentDetails = await Promise.all(
      appointments.map(async (appointment) => {
        // Get doctor details
        const doctor = await User.findById(appointment.doctorId);
        
        // Get doctor's professional details
        const doctorProfessional = await Doctor.findOne({ userId: appointment.doctorId });

        // Get patient details
        const patient = await User.findById(userId);

        return {
          appointment: {
            _id: appointment._id,
            type: appointment.type,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            notes: appointment.notes,
            roomId: appointment.roomId,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt
          },
          patient: {
            id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone,
            avatar: patient.avatar,
            gender: patient.gender,
            address: patient.address
          },
          doctor: {
            id: doctor._id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            email: doctor.email,
            phone: doctor.phone,
            avatar: doctor.avatar,
            gender: doctor.gender,
            degree: doctorProfessional?.degree,
            specialization: doctorProfessional?.specialization,
            experience: doctorProfessional?.experience,
            workingPlace: doctorProfessional?.workingPlace
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: appointmentDetails,
      message: "Appointments retrieved successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error while fetching appointments"
    });
  }
};


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
