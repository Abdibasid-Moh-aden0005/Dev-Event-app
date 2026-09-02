import mongoose, { type Mongoose, type ConnectOptions } from "mongoose";

/**
 * MongoDB connection URI from environment variables.
 */
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Interface representing the cached Mongoose connection structure.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend NodeJS global interface to store the cached connection across hot-reloads in development.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

/**
 * Global cache object to reuse MongoDB connections across invocations
 * in a serverless/hot-reloading Next.js environment.
 */
let cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose, caching the connection
 * to prevent multiple redundant connections during development and serverless execution.
 *
 * @returns {Promise<Mongoose>} Active Mongoose instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  // Return existing active connection if already connected
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is not already in progress, initiate one
  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset cached promise on failure so subsequent attempts can retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
