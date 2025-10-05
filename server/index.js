// THESE ARE NODE APIs WE WISH TO USE
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { createRateLimiter, userAwareKeyGenerator } = require("./middleware/rate-limiter");

// CREATE OUR SERVER
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();
app.set("trust proxy", 1);

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
const allowAllOrigins = allowedOrigins.includes("*");

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 240,
  message: "Too many requests from this client. Please wait a moment and try again.",
});

const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: userAwareKeyGenerator,
  message: "Too many authentication attempts detected. Please slow down before trying again.",
});

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require("./routes/auth-router");
app.use("/auth", authLimiter, authRouter);
const playlistsRouter = require("./routes/playlists-router");
app.use("/api", globalApiLimiter, playlistsRouter);

// INITIALIZE OUR DATABASE OBJECT
const db = require("./db");
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// PUT THE SERVER IN LISTENING MODE
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
