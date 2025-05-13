/**
 * MongoDB Database Connection Utility
 */
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaspabrawl';
const MONGODB_DB = process.env.MONGODB_DB || 'kaspabrawl';

// Type definitions for global MongoDB connection caching
declare global {
  var mongo: {
    conn: {
      client: MongoClient;
      db: any;
    } | null;
    promise: Promise<{
      client: MongoClient;
      db: any;
    }> | null;
  };
}

// Global MongoDB connection cache
if (!global.mongo) {
  global.mongo = {
    conn: null,
    promise: null
  };
}

/**
 * Connect to MongoDB database
 * Uses connection pooling and caching for optimal performance
 */
export async function connectToDatabase() {
  // Return cached connection if available
  if (global.mongo.conn) {
    return global.mongo.conn;
  }

  // Create new connection promise if needed
  if (!global.mongo.promise) {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    global.mongo.promise = MongoClient.connect(MONGODB_URI)
      .then(client => {
        return {
          client,
          db: client.db(MONGODB_DB)
        };
      });
  }

  // Wait for connection and cache it
  global.mongo.conn = await global.mongo.promise;
  return global.mongo.conn;
}
