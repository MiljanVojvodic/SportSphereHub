import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Projekat';

const connectDB = async (): Promise<void> => {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected to', MONGO_URI);
};

export default connectDB;
