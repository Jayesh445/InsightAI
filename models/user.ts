import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, maxlength: 64 },
  password: { type: String, required: false, maxlength: 64 },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
