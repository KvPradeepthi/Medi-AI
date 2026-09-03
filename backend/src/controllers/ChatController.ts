import { Response, NextFunction } from "express";
import { ChatRepository } from "../repositories/ChatRepository";
import { UserRepository } from "../repositories/UserRepository";
import { AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../config/logger";

export class ChatController {
  private chatRepository = new ChatRepository();
  private userRepository = new UserRepository();

  getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user?._id.toString();
      const receiverId = req.params.receiverId;

      if (!senderId || !receiverId) {
        return res.status(400).json({ message: "Sender or receiver ID missing" });
      }

      logger.info(`Fetching message logs between ${senderId} and ${receiverId}`);
      const history = await this.chatRepository.getChatHistory(senderId, receiverId);
      return res.status(200).json(history);
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };

  getRecentContacts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized context" });
      }

      const contactIds = await this.chatRepository.getRecentChatContacts(userId);
      const contacts = await Promise.all(
        contactIds.map(async (id) => {
          const u = await this.userRepository.findById(id);
          if (u) {
            return {
              _id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              specialization: u.specialization,
              hospital: u.hospital,
            };
          }
          return null;
        })
      );

      return res.status(200).json(contacts.filter((c) => c !== null));
    } catch (error: any) {
      res.status(500);
      next(error);
    }
  };
}
