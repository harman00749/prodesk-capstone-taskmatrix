import mongoose from "mongoose";
import { getEnv } from "./env.js";

export async function connectDatabase(): Promise<void> {
  const { MONGODB_URI } = getEnv();

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required to start the API server.");
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 8_000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
