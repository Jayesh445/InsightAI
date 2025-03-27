import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ Please add MONGODB_URI to your .env file");
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(uri, {
      dbName: "insight_ai", // Change this to your database name
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
