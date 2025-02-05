import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI); // No need for options like useNewUrlParser or useUnifiedTopology
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;