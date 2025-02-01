import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
const app = express();

const logger = morgan("dev");

app.use(logger);

app.use(
    cors({
      origin: "*", // Allow access from everywhere
      credentials: true,
    })
  );
  app.use(express.static("public"));
  app.use(cookieParser());
  
  app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from the server!");
  });


  export { app };