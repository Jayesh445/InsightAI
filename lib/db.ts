import { connectDB } from "./mongodb";
import User from "@/models/user";
import Chat from "@/models/chat";
import Reservation  from "@/models/reservation";
import { genSaltSync, hashSync } from "bcrypt-ts";

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

// ✅ Save Chat
export async function saveChat({ id, messages, userId }: { id: string; messages: any; userId: string }) {
    await connectDB();

    const existingChat = await Chat.findById(id);
    if (existingChat) {
        return Chat.findByIdAndUpdate(id, { messages }, { new: true });
    }

    return new Chat({ _id: id, messages, userId }).save();
}

// ✅ Delete Chat by ID
export async function deleteChatById(id: string) {
    await connectDB();
    return Chat.findByIdAndDelete(id).exec();
}

// ✅ Get Chats by User ID
export async function getChatsByUserId(userId: string) {
    await connectDB();
    return Chat.find({ userId }).sort({ createdAt: -1 }).exec();
}

// ✅ Get Chat by ID
export async function getChatById(id: string) {
    await connectDB();
    return Chat.findById(id).exec();
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
