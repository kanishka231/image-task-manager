// worker.mjs
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import axios from 'axios';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Redis connection
const connection = new IORedis({
    host: 'redis-12536.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: 12536,
    username: 'default',
    password: '2kqNZh4atM2Vqt4llWlS7Ap9HoOcCFUX',
    maxRetriesPerRequest: null
});

// MongoDB Schema
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

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://kanishkasonkar231:Kanishka38@cluster0.ix3yj.mongodb.net/imageProd?retryWrites=true&w=majority&appName=Cluster0");
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Monitor Redis connection
connection.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

connection.on('error', (error) => {
    console.error('❌ Redis error:', error);
});

const startWorker = async () => {
    await connectDB();

    const worker = new Worker(
        "imageQueue",
        async (job) => {
            console.log(`📝 Processing task: ${job.data.taskId}`);

            try {
                // Update status to "Processing"
                await Task.updateOne(
                    { taskId: job.data.taskId },
                    { $set: { status: "Processing" } }
                );

                console.log(`⏳ Waiting 1 minute for task: ${job.data.taskId}`);
                await new Promise((resolve) => setTimeout(resolve, 60000));

                // Check if the image URL is reachable
                const response = await axios.head(job.data.imageUrl);
                
                if (response.status === 200) {
                    await Task.updateOne(
                        { taskId: job.data.taskId },
                        { $set: { status: "Success" } }
                    );
                    console.log(`✅ Task ${job.data.taskId} completed successfully`);
                }
            } catch (error) {
                await Task.updateOne(
                    { taskId: job.data.taskId },
                    { $set: { status: "Failed" } }
                );
                console.log(`❌ Task ${job.data.taskId} failed:`, error.message);
            }
        },
        { 
            connection,
            concurrency: 2,
            removeOnComplete: {
                count: 1000
            },
            removeOnFail: {
                count: 1000
            }
        }
    );

    worker.on('completed', job => {
        console.log(`✨ Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
        console.error(`💥 Job ${job?.id} failed:`, err);
    });

    console.log("🚀 Worker started, waiting for tasks...");
};

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

startWorker().catch(console.error);