"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Task {
  taskId: string;
  imageUrl: string;
  status: "Pending" | "Processing" | "Success" | "Failed";
  timestamp: string;
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/api/task");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/task", { imageUrl });
      setImageUrl("");
      await fetchTasks();
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image URL Processor</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            required
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        {tasks.map((task) => (
          <div
            key={task.taskId}
            className="p-4 border rounded shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Task ID: {task.taskId}</p>
                <p className="text-sm text-gray-600 break-all">{task.imageUrl}</p>
                <p className="text-sm text-gray-500">
                  {new Date(task.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                task.status === "Success" ? "bg-green-100 text-green-800" :
                task.status === "Failed" ? "bg-red-100 text-red-800" :
                task.status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}