import Chat, { IChat } from "../models/Chat";

export class ChatRepository {
  async getChatHistory(userId1: string, userId2: string): Promise<IChat[]> {
    return Chat.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 });
  }

  async create(chatData: Partial<IChat>): Promise<IChat> {
    const chat = new Chat(chatData);
    return chat.save();
  }

  // Get list of users who have chatted with the target user
  async getRecentChatContacts(userId: string): Promise<string[]> {
    const chats = await Chat.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    const contactIds = new Set<string>();
    chats.forEach((chat) => {
      const sId = chat.senderId.toString();
      const rId = chat.receiverId.toString();
      if (sId !== userId) contactIds.add(sId);
      if (rId !== userId) contactIds.add(rId);
    });

    return Array.from(contactIds);
  }
}
