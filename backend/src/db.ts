import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGO_URI;
    
    // 🔒 SAFE DEBUG: This checks the string without leaking your password
    if (connString) {
      console.log(`🔎 Debug: MONGO_URI loaded successfully. Length: ${connString.length} characters.`);
      console.log(`🔎 Debug: Starts with: "${connString.substring(0, 15)}..."`);
    } else {
      console.log('🔎 Debug: MONGO_URI is completely UNDEFINED inside db.ts!');
    }

    if (!connString) {
      throw new Error('❌ MONGO_URI is missing from your backend .env file!');
    }

    const conn = await mongoose.connect(connString);
    console.log(`🍃 MongoDB Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection failed: ${(error as Error).message}`);
    process.exit(1);
  }
};