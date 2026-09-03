import { Server, Socket } from "socket.io";
import { ChatRepository } from "../repositories/ChatRepository";
import { logger } from "../config/logger";

const chatRepository = new ChatRepository();

export const setupSockets = (io: Server) => {
  logger.info("Initializing Socket.io server instance.");

  io.on("connection", (socket: Socket) => {
    logger.debug(`Socket client connected: ${socket.id}`);

    // Join room based on user IDs (joined alphabetically so patient and doctor join the same room)
    socket.on("join_room", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined private room: ${room}`);
    });

    // Handle real-time messaging
    socket.on("send_message", async ({ senderId, receiverId, messageType, content }) => {
      const room = [senderId, receiverId].sort().join("_");
      
      try {
        // 1. Save message to MongoDB Atlas database
        const savedMessage = await chatRepository.create({
          senderId,
          receiverId,
          messageType: messageType || "text",
          content,
        });

        // 2. Broadcast message to all clients in the room
        io.to(room).emit("receive_message", savedMessage);
        logger.debug(`Message sent in room ${room}: ${content}`);
      } catch (error: any) {
        logger.error(`Failed to handle real-time message: ${error.message}`);
        socket.emit("error_message", { message: "Message transmission failed." });
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.to(room).emit("user_typing", { senderId });
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join("_");
      socket.to(room).emit("user_stop_typing", { senderId });
    });

    socket.on("disconnect", () => {
      logger.debug(`Socket client disconnected: ${socket.id}`);
    });
  });
};
