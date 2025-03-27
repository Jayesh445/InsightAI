import mongoose, { Schema, Document } from "mongoose";

export interface IReservation extends Document {
  createdAt: Date;
  details: object;
  hasCompletedPayment: boolean;
  userId: mongoose.Types.ObjectId;
}

const ReservationSchema = new Schema<IReservation>({
  createdAt: { type: Date, default: Date.now },
  details: { type: Object, required: true },
  hasCompletedPayment: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Reservation =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", ReservationSchema);

export default Reservation;
