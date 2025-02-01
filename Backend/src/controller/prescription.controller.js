import Prescription from "../models/prescription.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
const newPrescription = async (req, res) => {
    try {
        const { user, doctor, prescription, medication, days } = req.body;

        // Validate required fields
        if (!user || !doctor || !prescription || !medication || !days) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate medication array structure
        if (!Array.isArray(medication) || medication.length === 0) {
            return res.status(400).json({ message: "Medication must be a non-empty array" });
        }

        // Validate each medication item
        for (const med of medication) {
            if (!med.name || !med.dosage || !med.time || !med.intakeTiming || !med.quantity) {
                return res.status(400).json({ message: "Invalid medication details" });
            }
        }

        // Create new prescription
        const newPrescription = new Prescription({
            user,
            doctor,
            prescription,
            medication,
            days,
            date: new Date()
        });

        await newPrescription.save();

        // Populate user and doctor details
        const populatedPrescription = await Prescription.findById(newPrescription._id)
            .populate('user', 'name email')
            .populate('doctor', 'name email');

        return res.status(201).json(populatedPrescription);
    } catch (error) {
        console.error("Error creating prescription:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAllPrescriptionsForUser = async (req, res) => {
    try {
        // Get user ID from authenticated user
        const userId = req.user._id; // Assuming authentication middleware sets req.user
        
        // Fetch prescriptions from database
        const prescriptions = await Prescription.find({ user: userId })
            .populate({
                path: 'doctor',
                select: 'firstName lastName specialization email' // Add or remove fields as needed
            })
            .sort({ createdAt: -1 }); // Sort by newest first
        
        if (!prescriptions || prescriptions.length === 0) {
            return res.status(404).json(
                new ApiResponse(404, null, "No prescriptions found for this user")
            );
        }

        // Transform the data to a more client-friendly format
        const formattedPrescriptions = prescriptions.map(prescription => ({
            id: prescription._id,
            prescriptionText: prescription.prescription,
            date: prescription.date,
            doctor: {
                id: prescription.doctor._id,
                name: `${prescription.doctor.firstName} ${prescription.doctor.lastName}`,
                specialization: prescription.doctor.specialization,
                email: prescription.doctor.email
            },
            medications: prescription.medication.map(med => ({
                name: med.name,
                dosage: med.dosage,
                time: med.time,
                intakeTiming: med.intakeTiming,
                notes: med.notes || "",
                quantity: med.quantity
            })),
            days: prescription.days,
            createdAt: prescription.createdAt,
            updatedAt: prescription.updatedAt
        }));

        return res.status(200).json(
            new ApiResponse(
                200, 
                formattedPrescriptions,
                "Prescriptions retrieved successfully"
            )
        );

    } catch (error) {
        console.error('Error in getAllPrescriptionsForUser:', error);
        throw new ApiError(500, "Error while fetching prescriptions");
    }
};

const getAllPrescriptionsByDoctor = async (req, res) => {
    try {
        // Get doctor ID from authenticated user
        const doctorId = req.user._id; // Assuming authentication middleware sets req.user
        
        // Optional query parameters for filtering
        const {
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = -1,
            page = 1,
            limit = 10
        } = req.query;

        // Build query object
        const query = { doctor: doctorId };

        // Add date range filter if provided
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch prescriptions from database with pagination
        const prescriptions = await Prescription.find(query)
            .populate({
                path: 'user',
                select: 'firstName lastName email phoneNumber' // Add or remove fields as needed
            })
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const totalPrescriptions = await Prescription.countDocuments(query);
        
        if (!prescriptions || prescriptions.length === 0) {
            return res.status(404).json(
                new ApiResponse(404, null, "No prescriptions found for this doctor")
            );
        }

        // Transform the data to a more client-friendly format
        const formattedPrescriptions = prescriptions.map(prescription => ({
            id: prescription._id,
            prescriptionText: prescription.prescription,
            date: prescription.date,
            patient: {
                id: prescription.user._id,
                name: `${prescription.user.firstName} ${prescription.user.lastName}`,
                email: prescription.user.email,
                phoneNumber: prescription.user.phoneNumber
            },
            medications: prescription.medication.map(med => ({
                name: med.name,
                dosage: med.dosage,
                time: med.time,
                intakeTiming: med.intakeTiming,
                notes: med.notes || "",
                quantity: med.quantity
            })),
            days: prescription.days,
            createdAt: prescription.createdAt,
            updatedAt: prescription.updatedAt
        }));

        // Prepare pagination info
        const paginationInfo = {
            currentPage: Number(page),
            totalPages: Math.ceil(totalPrescriptions / limit),
            totalPrescriptions,
            hasNextPage: page * limit < totalPrescriptions,
            hasPrevPage: page > 1
        };

        return res.status(200).json(
            new ApiResponse(
                200, 
                {
                    prescriptions: formattedPrescriptions,
                    pagination: paginationInfo
                },
                "Prescriptions retrieved successfully"
            )
        );

    } catch (error) {
        console.error('Error in getAllPrescriptionsByDoctor:', error);
        throw new ApiError(500, "Error while fetching prescriptions");
    }
};

export { newPrescription,getAllPrescriptionsForUser,getAllPrescriptionsByDoctor };

