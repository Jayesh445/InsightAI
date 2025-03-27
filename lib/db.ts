import { connectDB } from "./mongodb";
import User from "@/models/user";
import Reservation  from "@/models/reservation";
import { genSaltSync, hashSync } from "bcrypt-ts";
import ChatModel, { ChatDocument } from '../models/chat';

// ✅ Get User by Email
export async function getUser(email: string) {
    await connectDB();
    return User.findOne({ email }).exec();
}

// ✅ Create New User
export async function createUser(email: string, password: string) {
    await connectDB();
    let salt = genSaltSync(10);
    let hash = hashSync(password, salt);

    return new User({ email, password: hash }).save();
}

/**
 * Save a new chat message to the database.
 */
export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  context?: string
): Promise<ChatDocument> {
  const chat = await ChatModel.findOneAndUpdate(
    { userId },
    {
      $push: { messages: { role, content, timestamp: new Date() } },
      $set: { context },
    },
    { upsert: true, new: true }
  );
  return chat;
}

/**
 * Retrieve chat history for a user.
 */
export async function getChatHistory(userId: string): Promise<ChatDocument | null> {
  return ChatModel.findOne({ userId }).exec();
}

// ✅ Delete Chat by ID
export async function deleteChatById(id: string) {
    await connectDB();
    return ChatModel.findByIdAndDelete(id).exec();
}


// ✅ Get Chat by ID
export async function getChatById(id: string) {
    await connectDB();
    return ChatModel.findById(id).exec();
}

// ✅ Create Reservation
export async function createReservation({ id, userId, details }: { id: string; userId: string; details: any }) {
    await connectDB();
    return new Reservation({ _id: id, userId, details }).save();
}

// ✅ Get Reservation by ID
export async function getReservationById(id: string) {
    await connectDB();
    return Reservation.findById(id).exec();
}

// ✅ Update Reservation Payment Status
export async function updateReservation({ id, hasCompletedPayment }: { id: string; hasCompletedPayment: boolean }) {
    await connectDB();
    return Reservation.findByIdAndUpdate(id, { hasCompletedPayment }, { new: true }).exec();
}
