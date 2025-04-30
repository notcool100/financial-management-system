const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Load environment variables
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const loanRoutes = require('./routes/loan.routes');
const clientRoutes = require('./routes/client.routes');
const journalRoutes = require('./routes/journal.routes');
const reportRoutes = require('./routes/report.routes');
const smsRoutes = require('./routes/sms.routes');
const taxRoutes = require('./routes/tax.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const interestRoutes = require('./routes/interest.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');
const { requestLogger } = require('./middleware/logger.middleware');

// Import config
const { swaggerOptions } = require('./config/swagger.config');

// Initialize Express app
const app = express();

// Set up rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply middleware
app.use(helmet()); // Security headers
// Configure CORS with specific options
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Allow requests from any origin in development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logger
app.use(requestLogger); // Custom request logger
app.use(limiter); // Apply rate limiting

// Swagger documentation
const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interest', interestRoutes);
const staffRoutes = require('./routes/staff.routes');
app.use('/api', staffRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is working correctly',
    timestamp: new Date(),
    headers: req.headers,
    environment: process.env.NODE_ENV,
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      // Don't include the actual password
      passwordConfigured: !!process.env.DB_PASSWORD
    }
  });
});

// Test endpoint to check admin user
app.get('/api/test/admin', async (req, res) => {
  try {
    const { db } = require('./config/db.config');
    const user = await db.oneOrNone('SELECT id, name, email, role FROM users WHERE email = $1', ['admin@example.com']);
    
    res.status(200).json({
      success: true,
      message: 'Admin user check',
      adminExists: !!user,
      user: user || null
    });
  } catch (error) {
    console.error('Error checking admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking admin user',
      error: error.message
    });
  }
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

module.exports = app; // Export for testing