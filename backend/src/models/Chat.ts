import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  messageType: "text" | "image" | "report" | "voice";
  content: string; // The text content or URL of the resource (image/voice/file)
  createdAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "report", "voice"],
      default: "text",
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
