const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');

console.log('Starting server...');

// Load env vars
dotenv.config();
console.log("Mongo URI:", process.env.MONGO_URI);

// Connect to database
console.log('Connecting to database...');
const connectDB = require('./config/database');
connectDB();
console.log('Database connection initiated');

// Route files
console.log('Loading routes...');
// const authRoutes = require('./routes/auth');
// const jobSeekerRoutes = require('./routes/jobSeeker');
// const employerRoutes = require('./routes/employer');
// const jobRoutes = require('./routes/jobs');
// const interviewRoutes = require('./routes/interview');
// const resourceRoutes = require('./routes/resources');
// const consultationRoutes = require('./routes/consultations');
// const communityRoutes = require('./routes/community');
// const paymentRoutes = require('./routes/payments');
// const adminRoutes = require('./routes/admin');
// const galleryRoutes = require('./routes/gallery');
// const testimonialRoutes = require('./routes/testimonials');
// const faqRoutes = require('./routes/faqs');
// const courseRoutes = require('./routes/courses');
console.log('Routes loading skipped for debugging');

// Error handler
const errorHandler = require('./middleware/errorHandler');
console.log('Error handler loaded successfully');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
// app.use('/api/auth', authRoutes);
// app.use('/api/jobseeker', jobSeekerRoutes);
// app.use('/api/employer', employerRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/interview', interviewRoutes);
// app.use('/api/resources', resourceRoutes);
// app.use('/api/consultations', consultationRoutes);
// app.use('/api/community', communityRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/gallery', galleryRoutes);
// app.use('/api/testimonials', testimonialRoutes);
// app.use('/api/faqs', faqRoutes);
// app.use('/api/courses', courseRoutes);
console.log('Routes mounting skipped for debugging');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Hospitality Hire Hub API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Error handler
app.use(errorHandler);
console.log('Error handler applied successfully');

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    // Close server & exit process
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

module.exports = app;
