import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";
import { redisConnection } from "@/config/redis";
import  connectDB  from "@/config/connectdb";
import Task from "@/models/Task";

const taskQueue = new Queue("imageQueue", { connection: redisConnection });

export async function GET() {
  try {
    await connectDB();
    const tasks = await Task.find().sort({ timestamp: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTask = await Task.create({
      taskId,
      imageUrl,
      status: "Pending",
      timestamp: new Date(),
    });

    await taskQueue.add("processImage", { taskId, imageUrl });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}