import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
dotenv.config();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "UPDATE", "PUT"],
  })
);
app.use(limiter);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Routes
import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import prescriptionRouter from "./routes/prescription.routes.js";

app.use("/auth", userRouter);
app.use("/chat", chatRouter);
app.use("/doctor", doctorRouter);
app.use("/appointment", appointmentRouter);
app.use("/prescription", prescriptionRouter);

export default app;
