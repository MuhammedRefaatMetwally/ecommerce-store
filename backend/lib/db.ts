import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`MongoDb connected ${connect.connection.host}`);
  } catch (error) {
    console.log("Error connection to MongoDB" + error.message);
    process.exit(1);
  }
};
