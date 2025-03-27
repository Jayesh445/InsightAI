import mongoose, { Schema, Document, Model } from 'mongoose';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatDocument extends Document {
  userId: string; 
  messages: ChatMessage[]; 
  context: string; 
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<ChatDocument>(
  {
    userId: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    context: { type: String, default: '' },
  },
  { timestamps: true }
);

const ChatModel: Model<ChatDocument> =
  mongoose.models.Chat || mongoose.model<ChatDocument>('Chat', ChatSchema);

export default ChatModel;