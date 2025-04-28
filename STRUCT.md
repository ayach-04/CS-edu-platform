# EDU CS PLATFORM - PROJECT STRUCTURE

This document provides a comprehensive overview of the Edu CS educational platform project structure, including installed dependencies, project schema, file organization, and API endpoints.

## 1. INSTALLED DEPENDENCIES

### Node.js Dependencies (Root)
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.74.4",
    "@tanstack/react-query-devtools": "^5.74.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "lucide-react": "^0.501.0",
    "mongodb": "^6.13.1",
    "multer": "^1.4.5-lts.2",
    "mysql2": "^3.12.0",
    "tailwind-merge": "^3.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17"
  }
}
```

### Client-Side Dependencies (React)
```json
{
  "dependencies": {
    "axios": "^1.8.4",
    "jwt-decode": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-pdf": "^9.2.1",
    "react-router-dom": "^7.5.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.22.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.15",
    "eslint": "^9.22.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "postcss": "^8.4.29",
    "tailwindcss": "^3.3.3",
    "vite": "^6.3.1"
  }
}
```

### Server-Side Dependencies (Express)
```json
{
  "dependencies": {
    "axios": "^1.8.4",
    "bcrypt": "^5.1.1",
    "bcryptjs": "^3.0.2",
    "cloudinary": "^1.41.3",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.13.2",
    "multer": "^1.4.5-lts.2",
    "multer-storage-cloudinary": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9"
  }
}
```

## 2. PROJECT SCHEMA

The Edu CS platform follows a client-server architecture with the following structure:

```
The Platform/
├── client/                 # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── assets/         # Images, icons, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main application component
│   │   ├── index.css       # Global styles
│   │   └── main.jsx        # Application entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
│
├── server/                 # Express backend application
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Mongoose data models
│   ├── routes/             # API route definitions
│   ├── scripts/            # Utility scripts
│   ├── uploads/            # File storage directory
│   ├── utils/              # Utility functions
│   ├── .env                # Environment variables
│   ├── server.js           # Server entry point
│   └── package.json        # Backend dependencies
│
├── .env.example            # Example environment variables
├── package.json            # Root dependencies
└── vercel.json             # Vercel deployment configuration
```

## 3. UNUSED FILES TO DELETE

The following files are unused and can be safely deleted:

1. `server/adminRoutes.js` (replaced by `adminRoutes.new.js`)
2. `server/teacherRoutes.js` (replaced by `teacherRoutes.new.js`)
3. `server/studentRoutes.js` (replaced by `studentRoutes.new.js`)
4. `server/adminController.js` (replaced by `adminController.new.js`)
5. `server/teacherController.js` (replaced by `teacherController.new.js`)
6. `server/studentController.js` (replaced by `studentController.new.js`)
7. `server/checkDB.js` (functionality integrated into server.js)
8. `server/testAPI.js` (testing utility, not needed in production)
9. `server/testToken.js` (testing utility, not needed in production)

## 4. FILE FUNCTIONS

### Client-Side Files

#### Main Application Files

- **client/src/main.jsx**: Entry point for the React application that renders the App component.
  ```jsx
  // Initializes the React application and renders the root component
  // Uses React.StrictMode for development error checking
  ```

- **client/src/App.jsx**: Main application component that sets up routing and authentication.
  ```jsx
  // Defines the application's routing structure
  // Implements protected routes based on user roles
  // Manages authentication state and user context
  ```

- **client/src/index.css**: Global CSS styles using Tailwind CSS.
  ```css
  /* Imports Tailwind CSS base, components, and utilities */
  /* Defines custom color variables and global styles */
  ```

#### Components Directory

- **client/src/components/**: Contains reusable UI components.
  - **UI components**: Buttons, cards, forms, modals, etc.
  - **Layout components**: Headers, footers, sidebars, etc.
  - **Feature components**: Module cards, quiz components, file upload components, etc.

#### Pages Directory

- **client/src/pages/**: Contains page-level components.
  - **Auth pages**: Login, register, forgot password, etc.
  - **Dashboard pages**: Admin, teacher, and student dashboards.
  - **Module pages**: Module listing, module details, module creation/editing.
  - **Quiz pages**: Quiz listing, quiz taking, quiz creation/editing.

#### Contexts Directory

- **client/src/contexts/**: Contains React context providers.
  - **AuthContext**: Manages authentication state and user information.
  - **ThemeContext**: Manages application theme settings.

#### Services Directory

- **client/src/services/**: Contains API service functions.
  - **api.js**: Base API configuration and request handling.
  - **authService.js**: Authentication-related API calls.
  - **moduleService.js**: Module-related API calls.
  - **quizService.js**: Quiz-related API calls.

#### Utils Directory

- **client/src/utils/**: Contains utility functions.
  - **formatters.js**: Date, time, and text formatting functions.
  - **validators.js**: Form validation functions.
  - **helpers.js**: General helper functions.

### Server-Side Files

#### Main Server Files

- **server/server.js**: Main server entry point.
  ```javascript
  // Initializes Express application
  // Sets up middleware (CORS, JSON parsing, etc.)
  // Connects to MongoDB database
  // Registers API routes
  // Configures file serving for uploads
  // Implements error handling
  ```

- **server/.env**: Environment variables for server configuration.
  ```
  // Contains sensitive configuration like:
  // MongoDB connection string
  // JWT secret key
  // Port number
  // Environment mode (development/production)
  ```

#### Controllers Directory

- **server/controllers/**: Contains request handlers for API endpoints.
  - **authController.js**: Handles authentication requests (login, register, etc.).
  - **adminController.new.js**: Handles admin-specific requests.
  - **teacherController.new.js**: Handles teacher-specific requests.
  - **studentController.new.js**: Handles student-specific requests.
  - **quizController.js**: Handles quiz-related requests.

#### Models Directory

- **server/models/**: Contains Mongoose data models.
  - **User.js**: User model with role-based fields.
  - **Module.js**: Educational module model.
  - **Lesson.js**: Lesson model (part of modules).
  - **Quiz.js**: Quiz model with questions and answers.
  - **QuizSubmission.js**: Records of student quiz submissions.
  - **Enrollment.js**: Records of student enrollments in modules.

#### Routes Directory

- **server/routes/**: Contains API route definitions.
  - **authRoutes.js**: Authentication routes.
  - **adminRoutes.new.js**: Admin-specific routes.
  - **teacherRoutes.new.js**: Teacher-specific routes.
  - **studentRoutes.new.js**: Student-specific routes.
  - **quizRoutes.js**: Quiz-related routes.

#### Middlewares Directory

- **server/middlewares/**: Contains Express middlewares.
  - **authMiddleware.js**: Authentication and authorization middleware.
  - **roleMiddleware.js**: Role-based access control middleware.
  - **uploadMiddleware.js**: File upload handling middleware using Multer.
  - **dbErrorMiddleware.js**: Database error handling middleware.

#### Config Directory

- **server/config/**: Contains configuration files.
  - **db.js**: Database connection configuration.
  - **auth.js**: Authentication configuration.

#### Uploads Directory

- **server/uploads/**: Directory for storing uploaded files.
  - Files are organized by module and chapter.

## 5. CODE EXPLANATIONS

### Client-Side Code

#### React Components

- **Component Structure**: Uses functional components with React Hooks.
- **State Management**: Uses React Context API for global state.
- **Routing**: Uses React Router for navigation.
- **API Calls**: Uses Axios for HTTP requests.
- **Styling**: Uses Tailwind CSS for styling with custom color palette.

#### Authentication Flow

- JWT-based authentication with token storage in localStorage.
- Role-based access control for different user types (admin, teacher, student).
- Protected routes that redirect unauthenticated users to login.

#### File Handling

- Uses file input elements for file selection.
- Sends files to server using FormData and multipart/form-data.
- Displays files with appropriate icons based on file type.
- Opens viewable files (PDFs, images, etc.) in browser.

#### Quiz Implementation

- Displays quizzes with questions and multiple-choice answers.
- Automatically advances to next question when answer is selected.
- Shows immediate feedback (correct/incorrect) for each answer.
- Calculates and displays final score after quiz completion.
- Allows quiz retaking with updated scores.

### Server-Side Code

#### Express Application

- Uses Express.js for API server.
- Implements CORS for cross-origin requests.
- Uses JSON middleware for request body parsing.
- Implements custom logging middleware.

#### Authentication System

- Uses bcrypt for password hashing.
- Uses JWT for token-based authentication.
- Implements role-based authorization.
- Provides endpoints for login, registration, and password reset.

#### Database Models

- Uses Mongoose for MongoDB object modeling.
- Implements schema validation for data integrity.
- Uses references between models for relationships.

#### File Upload System

- Uses Multer for handling multipart/form-data.
- Stores files in local filesystem with unique names.
- Serves files with appropriate content types.
- Implements file size limits (< 50MB).

#### Error Handling

- Implements global error handling middleware.
- Returns appropriate HTTP status codes and error messages.
- Handles database connection errors gracefully.

## 6. API ENDPOINTS

### Authentication Endpoints

- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Authenticate a user and return a token.
- **POST /api/auth/forgot-password**: Initiate password reset process.
- **POST /api/auth/reset-password**: Complete password reset process.
- **GET /api/auth/me**: Get current user information.
- **PUT /api/auth/update-profile**: Update user profile information.
- **PUT /api/auth/change-password**: Change user password.
- **PUT /api/auth/update-security-question**: Update security question and answer.

### Admin Endpoints

- **GET /api/admin/users**: Get all users.
- **GET /api/admin/users/:id**: Get user by ID.
- **POST /api/admin/users**: Create a new user.
- **PUT /api/admin/users/:id**: Update a user.
- **DELETE /api/admin/users/:id**: Delete a user.
- **GET /api/admin/stats**: Get admin dashboard statistics.

### Teacher Endpoints

- **GET /api/teacher/modules**: Get teacher's modules.
- **GET /api/teacher/modules/:id**: Get module by ID.
- **POST /api/teacher/modules**: Create a new module.
- **PUT /api/teacher/modules/:id**: Update a module.
- **DELETE /api/teacher/modules/:id**: Delete a module.
- **POST /api/teacher/modules/:id/chapters**: Add a chapter to a module.
- **PUT /api/teacher/modules/:id/chapters/:chapterId**: Update a chapter.
- **DELETE /api/teacher/modules/:id/chapters/:chapterId**: Delete a chapter.
- **POST /api/teacher/modules/:id/references**: Add a reference to a module.
- **DELETE /api/teacher/modules/:id/references/:referenceId**: Delete a reference.
- **GET /api/teacher/stats**: Get teacher dashboard statistics.

### Student Endpoints

- **GET /api/student/modules**: Get available modules.
- **GET /api/student/modules/:id**: Get module details.
- **POST /api/student/modules/:id/enroll**: Enroll in a module.
- **GET /api/student/enrolled-modules**: Get enrolled modules.
- **GET /api/student/stats**: Get student dashboard statistics.

### Quiz Endpoints

- **GET /api/quizzes**: Get all quizzes.
- **GET /api/quizzes/:id**: Get quiz by ID.
- **POST /api/quizzes**: Create a new quiz.
- **PUT /api/quizzes/:id**: Update a quiz.
- **DELETE /api/quizzes/:id**: Delete a quiz.
- **POST /api/quizzes/:id/submit**: Submit a quiz attempt.
- **GET /api/quizzes/:id/results**: Get quiz results.

### File Endpoints

- **GET /uploads/:filename**: Serve uploaded files.
- **GET /api/check-file/:filename**: Check if a file exists.

## 7. DATABASE MODELS

### User Model

```javascript
// User model with role-based fields
// Stores user authentication and profile information
// Includes fields for security questions and academic information
```

**Attributes:**
- `username`: String (required, unique)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: String (enum: 'admin', 'teacher', 'student')
- `firstName`: String
- `lastName`: String
- `securityQuestion`: String
- `securityAnswer`: String (hashed)
- `academicYear`: String (for students)
- `level`: String (for students)
- `department`: String (for teachers)
- `createdAt`: Date
- `updatedAt`: Date

### Module Model

```javascript
// Module model representing educational modules
// Contains chapters, references, and syllabus
// Tracks teacher ownership and student enrollments
```

**Attributes:**
- `title`: String (required)
- `description`: String
- `academicYear`: String
- `level`: String
- `semester`: String
- `teacher`: ObjectId (ref: 'User')
- `chapters`: Array of Chapter objects
- `references`: Array of Reference objects
- `syllabus`: Array of File objects
- `enrolledStudents`: Number
- `createdAt`: Date
- `updatedAt`: Date

### Lesson Model (Chapter)

```javascript
// Lesson model representing chapters within modules
// Contains title, description, and files
// Used for organizing educational content
```

**Attributes:**
- `title`: String (required)
- `description`: String
- `files`: Array of File objects
- `moduleId`: ObjectId (ref: 'Module')
- `order`: Number
- `createdAt`: Date
- `updatedAt`: Date

### Quiz Model

```javascript
// Quiz model for educational assessments
// Contains questions with multiple-choice answers
// Tracks which module the quiz belongs to
```

**Attributes:**
- `title`: String (required)
- `moduleId`: ObjectId (ref: 'Module')
- `questions`: Array of Question objects
  - `text`: String
  - `options`: Array of Strings
  - `correctAnswer`: Number (index of correct option)
- `createdAt`: Date
- `updatedAt`: Date

### QuizSubmission Model

```javascript
// QuizSubmission model for tracking student quiz attempts
// Records answers and calculates scores
// Links to both the quiz and the student
```

**Attributes:**
- `quizId`: ObjectId (ref: 'Quiz')
- `studentId`: ObjectId (ref: 'User')
- `answers`: Array of Numbers (indices of selected options)
- `score`: Number
- `completed`: Boolean
- `submittedAt`: Date

### Enrollment Model

```javascript
// Enrollment model for tracking student module enrollments
// Links students to modules they are enrolled in
// Tracks enrollment date
```

**Attributes:**
- `moduleId`: ObjectId (ref: 'Module')
- `studentId`: ObjectId (ref: 'User')
- `enrolledAt`: Date
