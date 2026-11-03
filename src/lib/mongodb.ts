import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined in environment variables. Please set it in .env.local or Vercel dashboard."
    );
  }

  if (MONGODB_URI.includes("<db_password>")) {
    throw new Error(
      "MongoDB password placeholder detected: Please replace '<db_password>' with your actual MongoDB Atlas password in .env.local or your Vercel Environment Variables."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

export async function checkDbConnection(): Promise<{
  connected: boolean;
  message: string;
  hasPasswordPlaceholder: boolean;
}> {
  if (!MONGODB_URI) {
    return {
      connected: false,
      message: "MONGODB_URI environment variable is missing.",
      hasPasswordPlaceholder: false,
    };
  }

  if (MONGODB_URI.includes("<db_password>")) {
    return {
      connected: false,
      message:
        "MongoDB password not set yet. Replace <db_password> in .env.local or Vercel environment variables.",
      hasPasswordPlaceholder: true,
    };
  }

  try {
    await connectToDatabase();
    return {
      connected: true,
      message: "Connected to MongoDB Atlas successfully.",
      hasPasswordPlaceholder: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect to MongoDB Atlas";
    return {
      connected: false,
      message: msg,
      hasPasswordPlaceholder: false,
    };
  }
}

