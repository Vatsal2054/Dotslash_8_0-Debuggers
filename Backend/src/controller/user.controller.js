import User from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const createUser = async (req, res) => {
  const [firstName, lastName, email, password, role, phone, address, gender] =
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
      .json(new ApiResponse("Please provide all required fields", false));
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(new ApiResponse("Email already in use", false));
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
    await newUser.save();

    // Respond with a success message (you can exclude the password in the response if you want)
    res.status(201).json(new ApiResponse("User created successfully", true));
  } catch (error) {
    res.status(500).json(new ApiResponse(error.message, false));
  }
};

const getUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiResponse("User not found", false));
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(new ApiResponse("Invalid Password", false));
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
    res.status(200).json(new ApiResponse("Success", true)); 
  } catch (error) {
    res.status(500).json(new ApiResponse(error.message, false));
  }
};

const logout = (req, res) => {

  res.clearCookie("token");
  res.status(200).json(new ApiResponse("Logged out successfully", true)); 
}

export { createUser, getUser, logout };
