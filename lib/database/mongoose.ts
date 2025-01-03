import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) {
    console.log("Using existing database connection");
    return cached.conn;
  }

  if (!MONGODB_URL) throw new Error("Missing MongoDB URL");

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: "Imaginify",
      bufferCommands: false,
    }).then((mongooseInstance) => {
      console.log("Connected to MongoDB");
      return mongooseInstance;
    }).catch((err) => {
      console.error("MongoDB connection error:", err.message);
      throw err; // Ensure errors propagate correctly
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
