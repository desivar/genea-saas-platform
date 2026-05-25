import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGO_URI;
    
    if (!connString) {
      throw new Error('❌ MONGO_URI is missing from your environment variables!');
    }

    const conn = await mongoose.connect(connString);
    console.log(`🍃 MongoDB Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection failed: ${(error as Error).message}`);
    process.exit(1); // Crash the app immediately if the database won't connect
  }
};