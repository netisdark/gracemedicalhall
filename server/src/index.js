import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import 'dotenv/config'; // ESM-safe: loads .env as a side-effect before other modules
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import Route Handlers
import authRoutes from './routes/auth.js';
import medicineRoutes from './routes/medicines.js';
import saleRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';
import auditRoutes from './routes/audit.js';

// Connect to MongoDB
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Trust proxy — required on Render/Heroku for secure cookies to work behind a reverse proxy
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// CORS config supporting credentials (necessary for httpOnly cookies and csrf validation)
// CLIENT_URL env var should be set to the deployed frontend origin on Render
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean); // remove undefined/null entries
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked request from unlisted origin: ${origin}`);
    console.warn(`[CORS] Allowed origins:`, allowedOrigins);
    return callback(new Error('CORS Policy block: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

// Request limit parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// NoSQL query sanitization
app.use(mongoSanitize());

// General rate limiter
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);

// Catch-all
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server.`
  });
});

// Centralized Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Grace Medical Hall Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
