import mongoose from "mongoose";
import { env } from "@/config/env";

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then(() => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
    if (env.NODE_ENV === "development") {
      console.log("✅ MongoDB connected");
    }
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB Connection Error: ", error);
    throw new Error("Failed to connect to MongoDB");
  }

  return cached.conn;
}

export default dbConnect;
