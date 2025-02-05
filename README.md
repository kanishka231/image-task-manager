# Image URL Processor

## Project Overview
The Image URL Processor is a Next.js application that implements a job queue system to process image URLs asynchronously. The system validates image URLs by checking their accessibility and updates their status accordingly. The application uses Redis for job queueing (via BullMQ), MongoDB for data persistence, and provides a real-time web interface to monitor task status.

## Technology Stack
- **Frontend:** Next.js with React
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Queue System:** Redis (BullMQ)
- **Additional Libraries:** axios, ioredis, mongoose

## System Architecture
### Components
#### Web Interface (`app/page.tsx`)
- Provides URL submission form
- Displays real-time task status
- Polls for updates every 5 seconds

#### API Routes (`app/api/task/route.ts`)
- Handles task creation
- Retrieves task status
- Manages queue job creation

#### Worker Process (`worker.ts`)
- Processes queued jobs
- Updates task status
- Validates image URLs
- Implements concurrency control

#### Data Models (`models/Task.ts`)
- MongoDB schema for tasks
- Tracks task status and metadata

## Setup Instructions
### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- Redis instance
- npm or yarn package manager

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
```

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/kanishka231/image-task-manager.git
   cd image-task-manager
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables as mentioned above.
4. Start the development server in one terminal:
   ```bash
   npm run dev
   ```
5. Start the worker process open another terminal and run this command:
   ```bash
   node worker.mjs
   ```

## Project Structure
```
├── app/
│   ├── api/
│   │   └── task/
│   │       └── route.ts
│   └── page.tsx
├── config/
│   ├── connectdb.ts
│   └── redis.ts
├── models/
│   └── Task.ts
├── worker.mjs
└── package.json
```

## API Endpoints
### `GET /api/task`
Retrieves all tasks sorted by timestamp in descending order.
#### Response:
```json
[
  {
    "taskId": "string",
    "imageUrl": "string",
    "status": "Pending|Processing|Success|Failed",
    "timestamp": "date"
  }
]
```

### `POST /api/task`
Creates a new image processing task.
#### Request body:
```json
{ "imageUrl": "string" }
```
#### Response:
```json
{
  "taskId": "string",
  "imageUrl": "string",
  "status": "Pending",
  "timestamp": "date"
}
```

## Worker Configuration
- **Concurrency:** 2 concurrent jobs
- **Processing time:** 60 seconds per job
- **Automatic job removal:** After 1000 completed/failed jobs
- **Error handling** for both Redis and MongoDB connections

## Task States
- **Pending:** Initial state when task is created
- **Processing:** Task is being processed by worker
- **Success:** Image URL is accessible
- **Failed:** Image URL is inaccessible or error occurred
## Screenshots

![Screenshot](/public/ss2.png)
![Screenshot](/public/ss.png)
## Error Handling
- MongoDB connection errors
- Redis connection errors
- Invalid image URLs
- Network timeouts
- Unhandled rejections and exceptions

## Monitoring and Maintenance
### Redis Monitoring
- Connection status logging
- Error event handling
- Queue size monitoring

### MongoDB Monitoring
- Connection status logging
- Error event handling
- Task status tracking

## Development Guidelines
### Adding New Features
- Create new API endpoints in `app/api/`
- Update MongoDB schema in `models/`
- Modify worker logic in `worker.mjs`
- Update UI components in `app/page.tsx`




### Best Practices
- Implement error handling for all async operations
- Use TypeScript interfaces for type safety
- Follow React hooks guidelines
- Maintain consistent error logging
- Handle edge cases in worker process

## Performance Considerations
- Worker concurrency limits
- Polling interval adjustments
- MongoDB index optimization
- Redis connection pooling
- Error retry strategies

## Security Considerations
- Validate input URLs
- Implement rate limiting
- Secure environment variables
- Handle MongoDB injection prevention
- Implement API authentication (if needed)

## Troubleshooting
### Common Issues
#### Redis Connection Failures
- Verify Redis credentials
- Check network connectivity
- Confirm Redis server status

#### MongoDB Connection Issues
- Verify connection string
- Check network access
- Confirm database permissions

#### Worker Process Crashes
- Check error logs
- Verify memory usage
- Monitor CPU utilization

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=true
```

## Future Improvements
- Add authentication system
- Implement webhook notifications
- Add image metadata extraction
- Implement retry mechanism for failed tasks
- Add batch processing capability
