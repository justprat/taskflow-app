import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.js';
import taskRoutes from './routes/task.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration: Restricts API access to authorized origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy. Origin not allowed.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware: parses incoming JSON bodies
app.use(express.json());

// Request logger for diagnostic tracing
app.use((req, reqResponse, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Bind route handlers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Fallback Route: If no endpoint matches, send a 404 JSON response
app.use((req, res, next) => {
  const error = new Error(`Cannot find requested route ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Register Global Error Handling Middleware (must be registered last)
app.use(errorMiddleware);

// Start the Express server only if not in testing environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` TaskFlow Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(` Port: ${PORT}`);
    console.log(` Local Server: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

export default app;
