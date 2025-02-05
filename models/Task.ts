import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Processing", "Success", "Failed"], 
    default: "Pending" 
  },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);

