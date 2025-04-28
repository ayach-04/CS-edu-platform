const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, birthDate, level, fieldOfStudy, academicYear, academicRank } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Validate student-specific fields
    if (role === 'student') {
      if (!birthDate || !level || !fieldOfStudy) {
        return res.status(400).json({
          success: false,
          message: 'Please provide birth date, level, and field of study for student registration'
        });
      }

      // Calculate age from birth date
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      if (age < 18 || age > 60) {
        return res.status(400).json({
          success: false,
          message: 'Students must be between 18 and 60 years old'
        });
      }

      if (!['lmd1', 'ing1'].includes(level)) {
        return res.status(400).json({
          success: false,
          message: 'Level must be one of: lmd1, ing1'
        });
      }

      if (fieldOfStudy !== 'Computer Science') {
        return res.status(400).json({
          success: false,
          message: 'Only Computer Science students are allowed'
        });
      }
    }

    // Validate teacher-specific fields
    if (role === 'teacher') {
      if (!birthDate || !academicRank) {
        return res.status(400).json({
          success: false,
          message: 'Please provide birth date and academic rank for teacher registration'
        });
      }

      // Calculate age from birth date
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }

      if (age < 24) {
        return res.status(400).json({
          success: false,
          message: 'Teachers must be at least 24 years old'
        });
      }

      // Validate academic email for teachers
      const academicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.[a-zA-Z]{2,})$/;
      if (!academicEmailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please use an academic email address (.edu or .ac.xx domain)'
        });
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      birthDate,
      level: role === 'student' ? level : undefined,
      academicYear: role === 'student' ? academicYear : undefined,
      fieldOfStudy: role === 'student' ? fieldOfStudy : undefined,

      academicRank: role === 'teacher' ? academicRank : undefined,
      isApproved: role === 'visitor' || role === 'admin' // Auto-approve visitors and admins
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: role === 'admin' || role === 'visitor'
          ? 'User registered successfully'
          : 'Registration successful. Please wait for admin approval.',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          username: user.username
        },
        token: generateToken(user._id, user.role)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is approved (for teachers and students)
    console.log('User role:', user.role, 'isApproved:', user.isApproved);
    if ((user.role === 'teacher' || user.role === 'student') && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval by an administrator'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);
    console.log('Generated token:', token ? 'Token generated successfully' : 'Token generation failed');

    // Prepare response
    const response = {
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        username: user.username
      },
      token: token
    };

    console.log('Sending login response');
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        birthDate: user.birthDate,
        level: user.level,
        academicYear: user.academicYear,
        fieldOfStudy: user.fieldOfStudy,
        academicRank: user.academicRank,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, level, academicYear, username } = req.body;

    // Validate input
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name and last name'
      });
    }

    // Validate name format (letters only)
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      return res.status(400).json({
        success: false,
        message: 'Names can only contain letters'
      });
    }

    // Create update object
    const updateData = { firstName, lastName };

    // Add username if provided
    if (username) {
      // Validate username format (letters and numbers only)
      const usernameRegex = /^[A-Za-z0-9]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          message: 'Username can only contain letters and numbers'
        });
      }

      // Check if username is already taken by another user
      const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }

      updateData.username = username;
    }

    // Add level and academicYear if provided and user is a student
    if (req.user.role === 'student') {
      if (level) {
        // Validate level
        const validLevels = ['lmd1', 'ing1']; // Only LMD1 and ING1 are valid
        if (!validLevels.includes(level)) {
          return res.status(400).json({
            success: false,
            message: 'Level must be one of: lmd1, ing1'
          });
        }
        updateData.level = level;
      }

      // Always calculate the current academic year for students
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

      // If we're in September or later, the academic year is currentYear-nextYear
      // Otherwise, it's previousYear-currentYear
      let calculatedAcademicYear;
      if (currentMonth >= 9) { // September is month 9
        calculatedAcademicYear = `${currentYear}-${currentYear + 1}`;
      } else {
        calculatedAcademicYear = `${currentYear - 1}-${currentYear}`;
      }

      updateData.academicYear = calculatedAcademicYear;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    // Prepare response data
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      username: user.username
    };

    // Add student-specific fields
    if (user.role === 'student') {
      userData.level = user.level;
      userData.academicYear = user.academicYear;
      userData.fieldOfStudy = user.fieldOfStudy;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userData }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Get user
    const user = await User.findById(req.user._id).select('+password');

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // If the current password and new password are the same, this is just a verification
    // Otherwise, update the password
    if (currentPassword !== newPassword) {
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      // This is just a verification, don't change the password
      res.status(200).json({
        success: true,
        message: 'Password verified successfully'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get security questions for a user
// @route   GET /api/auth/security-questions/:username
// @access  Public
const getSecurityQuestions = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a username'
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a student or teacher
    if (user.role !== 'student' && user.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Password reset is only available for students and teachers'
      });
    }

    // Check if user has security questions set up
    if (!user.securityQuestions || !user.securityQuestions.question1 || !user.securityQuestions.question2) {
      return res.status(400).json({
        success: false,
        message: 'Security questions not set up for this user'
      });
    }

    // Return the questions (but not the answers)
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        question1: user.securityQuestions.question1,
        question2: user.securityQuestions.question2
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Verify security answers and reset password
// @route   POST /api/auth/reset-password-with-security
// @access  Public
const resetPasswordWithSecurity = async (req, res) => {
  try {
    const { userId, answer1, answer2, newPassword } = req.body;

    if (!userId || !answer1 || !answer2 || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if security answers match (case insensitive)
    const isAnswer1Correct = user.securityQuestions.answer1.toLowerCase() === answer1.toLowerCase();
    const isAnswer2Correct = user.securityQuestions.answer2.toLowerCase() === answer2.toLowerCase();

    if (!isAnswer1Correct || !isAnswer2Correct) {
      return res.status(400).json({
        success: false,
        message: 'Security answers are incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Set security questions for a user
// @route   PUT /api/auth/security-questions
// @access  Private (with special case for registration)
const setSecurityQuestions = async (req, res) => {
  try {
    const { question1, answer1, question2, answer2, email } = req.body;

    if (!question1 || !answer1 || !question2 || !answer2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    let user;

    // Special case for registration flow (when email is provided)
    if (email) {
      // Find user by email (for registration flow)
      user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with the provided email'
        });
      }
    } else {
      // Normal flow - get user from request (set by auth middleware)
      user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    // Set security questions
    user.securityQuestions = {
      question1,
      answer1,
      question2,
      answer2
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Security questions set successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getSecurityQuestions,
  resetPasswordWithSecurity,
  setSecurityQuestions
};
