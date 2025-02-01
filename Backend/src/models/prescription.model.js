import mongoose, { Schema } from "mongoose";

const prescriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    prescription: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    medication: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        time: {
          type: String,
          required: true,
          enum: ["morning", "afternoon", "evening"],
        },
        intakeTiming: {
          type: String,
          required: true,
          enum: ["before meal", "after meal", "with meal"],
        },
        notes: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    days:{
        type: Number,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;

