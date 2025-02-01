import moongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstrName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["patient", "doctor"],
      default: "patient",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
    },
    address: new Schema({
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
    }),
  },
  {
    timestamps: true,
  }
);

const User = moongoose.model("User", userSchema);

export default User;
