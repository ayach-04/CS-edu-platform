const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import Cloudinary configuration
const { cloudinary } = require('./config/cloudinary');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
// Configure CORS - for both development and production
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://edu-cs-platform.vercel.app',
    'https://edu-cs-platform-client.vercel.app'
  ], // Allow specific origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  // Add response logging
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`Response for ${req.method} ${req.url} - Status: ${res.statusCode}`);
    console.log('Response data:', typeof data === 'string' ? data.substring(0, 200) : data);
    return originalSend.apply(res, arguments);
  };

  next();
});

// Serve uploaded files with proper content types
const uploadsDir = path.join(__dirname, 'uploads');
const serveStatic = require('serve-static');
const mime = require('mime-types');
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Skip logging uploads directory contents

// Custom middleware to serve files with proper content types
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.path);
  // Skip file request logging

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    // Get file extension and determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = mime.lookup(filePath) || 'application/octet-stream';

    // Set more specific content types for common file types
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.mp4', '.webm', '.mov'].includes(ext)) {
      contentType = `video/${ext.substring(1)}`;
    } else if (['.mp3', '.wav'].includes(ext)) {
      contentType = `audio/${ext.substring(1)}`;
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      contentType = `image/${ext === '.jpg' ? 'jpeg' : ext.substring(1)}`;
    } else if (['.doc', '.docx'].includes(ext)) {
      contentType = 'application/msword';
    } else if (['.ppt', '.pptx'].includes(ext)) {
      contentType = 'application/vnd.ms-powerpoint';
    }

    res.setHeader('Content-Type', contentType);

    // Set CORS headers to ensure files can be accessed from the frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Determine if the file should be viewed inline or downloaded
    // Files that can be viewed in browser should be inline
    const fileName = path.basename(filePath);
    const viewableTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav'
    ];

    // Check if the request specifically asks for download
    const forceDownload = req.query.download === 'true';

    if (viewableTypes.includes(contentType) && !forceDownload) {
      // For viewable files, set to inline for browser viewing
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      // Skip file serving logging
    } else {
      // For other files or when download is requested, force download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      // Skip file download logging
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    // Skip file not found logging
    next();
  }
});

// Fallback to static file serving
app.use('/uploads', express.static(uploadsDir));
// Skip static file serving logging

// Create a route to check if a file exists
app.get('/api/check-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({
      exists: true,
      size: stats.size,
      path: `/uploads/${filename}`,
      lastModified: stats.mtime
    });
  } else {
    res.json({ exists: false });
  }
});

// Skip environment variables logging

// Global flag to track database connection status
global.dbConnected = false;

// Connect to MongoDB with increased timeouts
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Reduced timeout for faster failure
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  bufferTimeoutMS: 10000
})
  .then(() => {
    console.log('MongoDB connected');
    global.dbConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue running in offline mode with mock data');
  });

// Import routes
const authRoutes = require('./routes/authRoutes');

// Import new controllers
const adminController = require('./controllers/adminController.new');
const teacherController = require('./controllers/teacherController.new');
const studentController = require('./controllers/studentController.new');

// Import middleware
const { protect } = require('./middlewares/authMiddleware');
const { authorize } = require('./middlewares/roleMiddleware');
const upload = require('./middlewares/uploadMiddleware');
const dbErrorMiddleware = require('./middlewares/dbErrorMiddleware');

// Import routes
const adminRoutes = require('./routes/adminRoutes.new');
const teacherRoutes = require('./routes/teacherRoutes.new');
const studentRoutes = require('./routes/studentRoutes.new');
const quizRoutes = require('./routes/quizRoutes');

// Apply database error middleware to all API routes
app.use('/api', dbErrorMiddleware);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', quizRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Educational Platform API is running');
});

// Log all registered routes
const listEndpoints = (app) => {
  try {
    if (!app._router) {
      console.log('No routes registered yet or router not accessible');
      return [];
    }

    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // Routes registered directly on the app
        routes.push({
          path: middleware.route.path,
          method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        });
      } else if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const path = handler.route.path;
            const method = Object.keys(handler.route.methods)[0].toUpperCase();
            routes.push({ path: path, method: method });
          }
        });
      }
    });
    return routes;
  } catch (error) {
    console.error('Error listing endpoints:', error.message);
    return ['Error listing routes: ' + error.message];
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;
