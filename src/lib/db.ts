import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Fail fast with a clear server-side message rather than an opaque connection error later.
if (!MONGODB_URI) {
  // Thrown only when a connection is actually attempted (see connectDB), not at import time,
  // so builds / linting don't require the env var to be present.
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reuse the connection across hot-reloads / serverless invocations.
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}

export default connectDB;
