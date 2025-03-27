import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IChat extends Document {
  createdAt: Date;
  messages: IMessage[];
  userId: mongoose.Types.ObjectId;
}

const ChatSchema = new Schema<IChat>({
  createdAt: { type: Date, default: Date.now },
  messages: { type: [{ role: String, content: String }], required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;
