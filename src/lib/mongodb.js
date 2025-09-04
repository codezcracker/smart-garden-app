import { MongoClient } from 'mongodb';

// Use hardcoded connection string as fallback for Vercel deployment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codezcracker:Ars%401234@atlascluster.fs3ipnn.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster';
const MONGODB_DB = process.env.MONGODB_DB || 'smartGardenDB';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 10000, // 10 seconds
      maxPoolSize: 10,
      retryWrites: true,
    };

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
