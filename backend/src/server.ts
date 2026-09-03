import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";

import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import reminderRoutes from "./routes/reminderRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";

import { setupSockets } from "./sockets/chat";
import { errorHandler } from "./middleware/error";

// 1. Initialize Express and Connect Database
const app = express();
connectDB();

// 2. Configure Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log HTTP requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url} - IP: ${req.ip}`);
  next();
});

// Configure uploads directory path
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Serve static uploads
app.use("/uploads", express.static(uploadsDir));

// 3. Mount Interactive Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info("Swagger documentation mounted at /api-docs");

// 4. Mount Versioned API Routes (/api/v1)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/reminders", reminderRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);

// Root health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 5. Mount Global Error Handler Middleware
app.use(errorHandler);

// 6. Bind Socket.io Server Instance
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // allow testing from client ports
    methods: ["GET", "POST"],
  },
});

setupSockets(io);

// 7. Start listener
const PORT = env.PORT;
server.listen(PORT, () => {
  logger.info(`MediAI Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
