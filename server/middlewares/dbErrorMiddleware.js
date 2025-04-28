// Middleware to handle database connection errors
const dbErrorMiddleware = (req, res, next) => {
  // Check if database is connected
  if (!global.dbConnected) {
    // For GET requests, return mock data
    if (req.method === 'GET') {
      // Check the route and return appropriate mock data
      if (req.path.includes('/quizzes')) {
        return res.status(200).json({
          success: true,
          message: 'Mock data (database offline)',
          data: getMockQuizData(req.path)
        });
      } else if (req.path.includes('/modules')) {
        return res.status(200).json({
          success: true,
          message: 'Mock data (database offline)',
          data: getMockModuleData(req.path)
        });
      } else if (req.path.includes('/users')) {
        return res.status(200).json({
          success: true,
          message: 'Mock data (database offline)',
          data: getMockUserData(req.path)
        });
      }
    } 
    // For POST, PUT, DELETE requests, simulate success
    else if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      // If it's a quiz submission, return mock submission data
      if (req.path.includes('/quizzes') && req.path.includes('/submit')) {
        return res.status(201).json({
          success: true,
          message: 'Quiz submitted successfully (mock data - database offline)',
          data: {
            _id: 'mock-submission-id',
            quiz: req.params.id || 'mock-quiz-id',
            student: 'mock-student-id',
            score: 1,
            maxScore: 2,
            isGraded: true,
            submittedAt: new Date(),
            isRetake: req.path.includes('retake') || Math.random() > 0.5
          }
        });
      }
      
      // For other write operations, return generic success
      return res.status(200).json({
        success: true,
        message: 'Operation successful (mock data - database offline)',
        data: { _id: 'mock-id-' + Date.now() }
      });
    }
  }
  
  // If database is connected or no mock data available, proceed to the actual handler
  next();
};

// Helper function to generate mock quiz data
function getMockQuizData(path) {
  // If it's a specific quiz
  if (path.match(/\/quizzes\/[a-zA-Z0-9]+$/)) {
    return {
      _id: path.split('/').pop(),
      title: 'Mock Quiz',
      module: { _id: 'mock-module-id', title: 'Mock Module' },
      questions: [
        {
          _id: 'mock-question-1',
          questionText: 'What is 1+1?',
          questionType: 'multiple-choice',
          options: [
            { _id: 'opt1', text: '1', isCorrect: false },
            { _id: 'opt2', text: '2', isCorrect: true },
            { _id: 'opt3', text: '3', isCorrect: false }
          ]
        },
        {
          _id: 'mock-question-2',
          questionText: 'What is the capital of France?',
          questionType: 'multiple-choice',
          options: [
            { _id: 'opt4', text: 'London', isCorrect: false },
            { _id: 'opt5', text: 'Paris', isCorrect: true },
            { _id: 'opt6', text: 'Berlin', isCorrect: false }
          ]
        }
      ],
      isPublished: true
    };
  }
  
  // If it's a list of quizzes
  return [
    {
      _id: 'mock-quiz-1',
      title: 'Mock Quiz 1',
      questions: [{ _id: 'q1' }, { _id: 'q2' }],
      isSubmitted: false
    },
    {
      _id: 'mock-quiz-2',
      title: 'Mock Quiz 2',
      questions: [{ _id: 'q3' }, { _id: 'q4' }],
      isSubmitted: true,
      score: 1,
      isGraded: true
    }
  ];
}

// Helper function to generate mock module data
function getMockModuleData(path) {
  // If it's a specific module
  if (path.match(/\/modules\/[a-zA-Z0-9]+$/)) {
    return {
      _id: path.split('/').pop(),
      title: 'Mock Module',
      description: 'This is a mock module for testing',
      academicYear: 'LMD1',
      semester: 'S1',
      teacher: { _id: 'mock-teacher-id', firstName: 'John', lastName: 'Doe' }
    };
  }
  
  // If it's a list of modules
  return [
    {
      _id: 'mock-module-1',
      title: 'Mock Module 1',
      description: 'This is mock module 1',
      academicYear: 'LMD1',
      semester: 'S1'
    },
    {
      _id: 'mock-module-2',
      title: 'Mock Module 2',
      description: 'This is mock module 2',
      academicYear: 'ING1',
      semester: 'S2'
    }
  ];
}

// Helper function to generate mock user data
function getMockUserData(path) {
  return [
    {
      _id: 'mock-user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'student'
    },
    {
      _id: 'mock-user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'teacher'
    }
  ];
}

module.exports = dbErrorMiddleware;
