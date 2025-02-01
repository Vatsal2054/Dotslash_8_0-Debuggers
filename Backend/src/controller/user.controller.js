import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role, phone, address, gender } =
    req.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !role ||
    !phone ||
    !address ||
    !gender
  ) {
    return res
      .status(400)
      .json(new ApiError(400, "1 Please provide all required fields", false));
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(new ApiError(400, "Email already in use", false));
    }

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      gender,
    });

    // Save the user to the database
    

    // Handling patient-specific data if the role is 'patient'
    if (user.role === "patient") {
      try{
      const { dob, bloodGroup, weight, height, allergies, disabled } = req.body;

      if (!dob || !bloodGroup || !weight || !height || !allergies || !disabled) {
        return res.status(400).json(new ApiError(400, "Please provide all required fields", false));
      }

      const newPatient = new Patient({
        dob,
        bloodGroup,
        weight,
        height,
        allergies,
        disabled,
        user: user._id,
      });

      let patient = await newPatient.save();
    }catch(error){
      return res.status(500).json(new ApiError(500, "server error", error.message));
    }
    }

    if(user.role === "doctor") {
      try{
      const {degree,specialization,experience,workingPlace,isAvailable}=req.body;

      if(!degree || !specialization || !experience || !workingPlace || !isAvailable){
        return res.status(400).json(new ApiError(400,"Please provide all required fields",false));
      }

      const newDoctor = new Doctor({
        degree,
        specialization,
        experience,
        workingPlace,
        isAvailable,
        user:user._id
      });
      let doctor = await newDoctor.save();

      
    }catch(error){
      return res.status(500).json(new ApiError(500,"server error",error.message));
    }}
    let user = await newUser.save();
    // Remove password before responding
    delete user.password;

    // Respond with a success message
    res
      .status(200)
      .json(new ApiResponse(200, user, "User created successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "server error", error.message));
  }
};

const getUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiError(401,"User not found", false));
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(new ApiError(401, "Invalid Password", false));
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 604800000,
    };
    res.cookie("token", token, options);

    // Respond with a 200 status and success message
    res.status(200).json(new ApiResponse("Success", true)); // Corrected the response format
  } catch (error) {
    res.status(500).json(new ApiError(500, "server error", error.message));
  }
};

const logout = async (req, res) => {
  try {
    

    // Clear the cookie with matching options as login
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    }
    res.clearCookie("token", options)

    res.status(200).json(
      new ApiResponse(200, null,"Logged out successfully")
    )
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Error during logout", error.message)
    )
  }
}




export { createUser, getUser, logout };
