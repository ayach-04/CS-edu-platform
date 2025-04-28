const Module = require('../models/Module');
const fs = require('fs');
const path = require('path');

// @desc    Get teacher's assigned modules
// @route   GET /api/teacher/modules
// @access  Private/Teacher
const getAssignedModules = async (req, res) => {
  try {
    const modules = await Module.find({ teacher: req.user._id })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
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

// @desc    Get module details
// @route   GET /api/teacher/modules/:id
// @access  Private/Teacher
const getModuleDetails = async (req, res) => {
  try {
    const module = await Module.findOne({
      _id: req.params.id,
      teacher: req.user._id
    }).populate('createdBy', 'name email');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Filter out temporary files from chapters
    if (module.chapters) {
      module.chapters.forEach(chapter => {
        if (chapter.files && chapter.files.length > 0) {
          chapter.files = chapter.files.filter(file => !file.temporary);
        }
      });
    }

    res.status(200).json({
      success: true,
      data: module
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

// @desc    Add chapter to module
// @route   POST /api/teacher/modules/:id/chapters
// @access  Private/Teacher
const addChapter = async (req, res) => {
  try {
    console.log('Add Chapter Request Body:', req.body);

    // Get data from the request body
    const { title, content } = req.body;
    const moduleId = req.params.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Chapter title is required'
      });
    }

    // Check if module exists and is assigned to this teacher
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Create new chapter
    const newChapter = {
      title,
      content: content || '',
      files: []
    };

    // Add chapter to module
    if (!module.chapters) {
      module.chapters = [];
    }

    module.chapters.push(newChapter);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Chapter added successfully',
      data: {
        moduleId,
        chapter: module.chapters[module.chapters.length - 1]
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

// @desc    Update module chapters
// @route   PUT /api/teacher/modules/:id/chapters
// @access  Private/Teacher
const updateModuleChapters = async (req, res) => {
  try {
    const { chapters } = req.body;
    const moduleId = req.params.id;

    console.log('Update Module Chapters Request Body:', req.body);

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Update chapters if provided
    if (chapters && Array.isArray(chapters)) {
      console.log('\n==== UPDATING CHAPTERS DEBUG ====');
      console.log('Updating chapters with:', chapters);
      console.log('Existing chapters:', module.chapters);

      // Process the chapters and properly handle files
      const updatedChapters = chapters.map((chapter, index) => {
        // Check if this chapter has files from the client
        const hasClientFiles = chapter.files && Array.isArray(chapter.files) && chapter.files.length > 0;

        // Get existing chapter if available
        const existingChapter = module.chapters && module.chapters[index];

        // Determine which files to use
        let files = [];

        if (hasClientFiles) {
          // Use files from the client
          console.log(`Using ${chapter.files.length} files from client for chapter ${index}`);

          // Make sure all file objects have the required fields and mark as permanent
          files = chapter.files.map(file => ({
            path: file.path,
            fileType: file.fileType || 'pdf',
            originalName: file.originalName || '',
            size: file.size || 0,
            uploadedAt: file.uploadedAt || new Date(),
            temporary: false // Mark as permanent when saving
          }));

          console.log('Processed files:', files);
        } else if (existingChapter && existingChapter.files) {
          // If no client files but we have existing files, preserve them
          console.log(`Preserving ${existingChapter.files.length} existing files for chapter ${index}`);
          files = existingChapter.files;
        }

        return {
          title: chapter.title,
          content: chapter.content || '',
          files: files
        };
      });

      console.log('Updated chapters:', updatedChapters);
      module.chapters = updatedChapters;
    }

    await module.save();

    res.status(200).json({
      success: true,
      message: 'Module chapters updated successfully',
      data: module
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

// @desc    Delete chapter from module
// @route   DELETE /api/teacher/modules/:id/chapters/:chapterIndex
// @access  Private/Teacher
const deleteChapter = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const chapterIndex = parseInt(req.params.chapterIndex);

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Check if chapter exists
    if (!module.chapters || !module.chapters[chapterIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Remove chapter
    module.chapters.splice(chapterIndex, 1);
    await module.save();

    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully'
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

// @desc    Upload file for a chapter
// @route   POST /api/teacher/modules/:id/chapters/:chapterIndex/files
// @access  Private/Teacher
const uploadChapterFile = async (req, res) => {
  try {
    const { id, chapterIndex } = req.params;
    const { fileType } = req.body;

    console.log('\n\n==== FILE UPLOAD DEBUG ====');
    console.log('Request params:', { id, chapterIndex, fileType });
    console.log('Request file:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file');
    console.log('Request headers:', req.headers);

    console.log('Upload chapter file request:', {
      moduleId: id,
      chapterIndex,
      fileType,
      file: req.file ? req.file.originalname : 'No file'
    });

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: id,
      teacher: req.user._id
    });

    if (!module) {
      console.error('Module not found or not assigned to you:', id);
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.error('No file uploaded');
      // File is optional, just return success without adding a file
      return res.status(200).json({
        success: true,
        message: 'No file uploaded, but chapter updated successfully',
        data: {
          moduleId: id,
          chapterIndex
        }
      });
    }

    console.log('Chapter file uploaded:', req.file);

    // Add file to chapter
    if (!module.chapters) {
      module.chapters = [];
    }

    // Ensure chapter exists
    if (!module.chapters[chapterIndex]) {
      module.chapters[chapterIndex] = {
        title: `Chapter ${Number(chapterIndex) + 1}`,
        content: '',
        files: []
      };
    }

    // Add file to chapter
    module.chapters[chapterIndex].files = module.chapters[chapterIndex].files || [];

    // Get file details
    const fs = require('fs');
    const path = require('path');

    // Check if we're in production (using Cloudinary)
    const isProduction = process.env.NODE_ENV === 'production';

    // Get file path and size
    let filePath, fileSize;

    if (isProduction && req.fileUrl) {
      // In production, use the Cloudinary URL
      filePath = req.fileUrl;
      fileSize = req.file.size || 0;

      console.log('Cloudinary file upload details:', {
        originalFilename: req.file.originalname,
        cloudinaryUrl: req.fileUrl,
        fileSize
      });
    } else {
      // In development, use the local file path
      const { uploadsDir } = require('../config/uploadConfig');
      filePath = `/uploads/${req.file.filename}`;
      fileSize = req.file.size || 0;

      console.log('Local file upload details:', {
        originalFilename: req.file.originalname,
        savedFilename: req.file.filename,
        filePath,
        fileSize
      });

      // Verify the file exists in the uploads directory
      const physicalPath = path.join(uploadsDir, req.file.filename);
      const fileExists = fs.existsSync(physicalPath);

      console.log('File exists in uploads directory:', fileExists);
    }

    console.log('\n==== FILE STORAGE DEBUG ====');
    console.log('File stored:', {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: fileSize,
      path: filePath,
      physicalPath,
      fileExists
    });

    // Create file object with all necessary metadata
    const fileObject = {
      path: filePath,  // URL path to access the file
      fileType: fileType || 'pdf',
      originalName: req.file.originalname, // Store original filename for better display
      size: fileSize,
      uploadedAt: new Date(),
      temporary: true // Mark as temporary until module is saved
    };

    console.log('Adding file to chapter:', fileObject);

    // Add file to chapter
    module.chapters[chapterIndex].files.push(fileObject);

    // Debug the module object before saving
    console.log('\n==== MODULE BEFORE SAVE ====');
    console.log('Module ID:', module._id);
    console.log('Chapter count:', module.chapters.length);
    console.log('Chapter files:', module.chapters.map(ch => ({
      title: ch.title,
      filesCount: ch.files ? ch.files.length : 0,
      files: ch.files ? ch.files.map(f => ({
        path: f.path,
        originalName: f.originalName,
        fileType: f.fileType
      })) : []
    })));

    // Save the module with the new file
    const savedModule = await module.save();
    console.log('\n==== MODULE AFTER SAVE ====');
    console.log('Module saved with new file');
    console.log('Saved module ID:', savedModule._id);
    console.log('Saved chapter count:', savedModule.chapters.length);
    console.log('Saved chapter files:', savedModule.chapters.map(ch => ({
      title: ch.title,
      filesCount: ch.files ? ch.files.length : 0,
      files: ch.files ? ch.files.map(f => ({
        path: f.path,
        originalName: f.originalName,
        fileType: f.fileType
      })) : []
    })));

    // Get the newly added file
    const newFile = module.chapters[chapterIndex].files[module.chapters[chapterIndex].files.length - 1];

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        moduleId: id,
        chapterIndex,
        file: {
          path: newFile.path,
          fileType: newFile.fileType,
          originalName: newFile.originalName,
          size: newFile.size,
          uploadedAt: newFile.uploadedAt
        }
      }
    });
  } catch (error) {
    console.error('Error uploading chapter file:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add or update syllabus
// @route   PUT /api/teacher/modules/:id/syllabus
// @access  Private/Teacher
const updateSyllabus = async (req, res) => {
  try {
    const { content } = req.body;
    const moduleId = req.params.id;

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Initialize syllabus if it doesn't exist
    if (!module.syllabus) {
      module.syllabus = {
        content: '',
        files: []
      };
    }

    // Update syllabus content
    module.syllabus.content = content || module.syllabus.content;

    // Mark any temporary files as permanent
    if (module.syllabus.files && module.syllabus.files.length > 0) {
      module.syllabus.files = module.syllabus.files.map(file => ({
        ...file.toObject(),
        temporary: false
      }));
    }

    await module.save();

    res.status(200).json({
      success: true,
      message: 'Syllabus updated successfully',
      data: module.syllabus
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

// @desc    Upload file for syllabus
// @route   POST /api/teacher/modules/:id/syllabus/files
// @access  Private/Teacher
const uploadSyllabusFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileType } = req.body;

    console.log('\n\n==== SYLLABUS FILE UPLOAD DEBUG ====');
    console.log('Request params:', { id, fileType });
    console.log('Request file:', req.file ? {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'No file');
    console.log('Request headers:', req.headers);

    console.log('Upload syllabus file request:', {
      moduleId: id,
      fileType,
      file: req.file ? req.file.originalname : 'No file'
    });

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: id,
      teacher: req.user._id
    });

    if (!module) {
      console.error('Module not found or not assigned to you:', id);
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.error('No file uploaded for syllabus');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('Syllabus file uploaded:', req.file);

    // Initialize syllabus if it doesn't exist
    if (!module.syllabus) {
      module.syllabus = {
        content: '',
        files: []
      };
    }

    // Get file details
    const fs = require('fs');
    const path = require('path');

    // Check if we're in production (using Cloudinary)
    const isProduction = process.env.NODE_ENV === 'production';

    // Get file path and size
    let filePath, fileSize;

    if (isProduction && req.fileUrl) {
      // In production, use the Cloudinary URL
      filePath = req.fileUrl;
      fileSize = req.file.size || 0;

      console.log('Cloudinary file upload details:', {
        originalFilename: req.file.originalname,
        cloudinaryUrl: req.fileUrl,
        fileSize
      });
    } else {
      // In development, use the local file path
      const { uploadsDir } = require('../config/uploadConfig');
      filePath = `/uploads/${req.file.filename}`;
      fileSize = req.file.size || 0;

      console.log('Local file upload details:', {
        originalFilename: req.file.originalname,
        savedFilename: req.file.filename,
        filePath,
        fileSize
      });

      // Verify the file exists in the uploads directory
      const physicalPath = path.join(uploadsDir, req.file.filename);
      const fileExists = fs.existsSync(physicalPath);

      console.log('File exists in uploads directory:', fileExists);
    }

    console.log('\n==== SYLLABUS FILE STORAGE DEBUG ====');
    console.log('File stored:', {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: fileSize,
      path: filePath,
      physicalPath,
      fileExists
    });

    // Create file object with all necessary metadata
    const fileObject = {
      path: filePath,
      fileType: fileType || 'pdf',
      originalName: req.file.originalname,
      size: fileSize,
      uploadedAt: new Date(),
      temporary: true // Mark as temporary until syllabus is saved
    };

    console.log('Adding file to syllabus:', fileObject);

    // Add file to syllabus
    module.syllabus.files.push(fileObject);

    // Debug the module object before saving
    console.log('\n==== MODULE BEFORE SAVE ====');
    console.log('Module ID:', module._id);
    console.log('Syllabus files count:', module.syllabus.files.length);
    console.log('Syllabus files:', module.syllabus.files.map(f => ({
      path: f.path,
      originalName: f.originalName,
      fileType: f.fileType
    })));

    // Save the module with the new file
    const savedModule = await module.save();
    console.log('\n==== MODULE AFTER SAVE ====');
    console.log('Module saved with new syllabus file');
    console.log('Saved module ID:', savedModule._id);
    console.log('Saved syllabus files count:', savedModule.syllabus.files.length);
    console.log('Saved syllabus files:', savedModule.syllabus.files.map(f => ({
      path: f.path,
      originalName: f.originalName,
      fileType: f.fileType
    })));

    res.status(200).json({
      success: true,
      message: 'File uploaded to syllabus successfully',
      data: {
        file: fileObject
      }
    });
  } catch (error) {
    console.error('Error uploading syllabus file:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add or update reference
// @route   POST /api/teacher/modules/:id/references
// @access  Private/Teacher
const addReference = async (req, res) => {
  try {
    const { title, description } = req.body;
    const moduleId = req.params.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Reference title is required'
      });
    }

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: moduleId,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Initialize references array if it doesn't exist
    if (!module.references) {
      module.references = [];
    }

    // Create new reference
    const newReference = {
      title,
      description: description || '',
      files: []
    };

    // Add reference to module
    module.references.push(newReference);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Reference added successfully',
      data: {
        reference: module.references[module.references.length - 1]
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

// @desc    Update reference
// @route   PUT /api/teacher/modules/:id/references/:referenceIndex
// @access  Private/Teacher
const updateReference = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id, referenceIndex } = req.params;

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: id,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Check if reference exists
    if (!module.references || !module.references[referenceIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Reference not found'
      });
    }

    // Update reference
    if (title) module.references[referenceIndex].title = title;
    if (description !== undefined) module.references[referenceIndex].description = description;

    // Mark any temporary files as permanent
    if (module.references[referenceIndex].files && module.references[referenceIndex].files.length > 0) {
      module.references[referenceIndex].files = module.references[referenceIndex].files.map(file => ({
        ...file.toObject(),
        temporary: false
      }));
    }

    await module.save();

    res.status(200).json({
      success: true,
      message: 'Reference updated successfully',
      data: {
        reference: module.references[referenceIndex]
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

// @desc    Delete reference
// @route   DELETE /api/teacher/modules/:id/references/:referenceIndex
// @access  Private/Teacher
const deleteReference = async (req, res) => {
  try {
    const { id, referenceIndex } = req.params;

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: id,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Check if reference exists
    if (!module.references || !module.references[referenceIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Reference not found'
      });
    }

    // Remove reference
    module.references.splice(referenceIndex, 1);
    await module.save();

    res.status(200).json({
      success: true,
      message: 'Reference deleted successfully'
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

// @desc    Upload file for reference
// @route   POST /api/teacher/modules/:id/references/:referenceIndex/files
// @access  Private/Teacher
const uploadReferenceFile = async (req, res) => {
  try {
    const { id, referenceIndex } = req.params;
    const { fileType } = req.body;

    // Find module and check if it's assigned to this teacher
    const module = await Module.findOne({
      _id: id,
      teacher: req.user._id
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found or not assigned to you'
      });
    }

    // Check if reference exists
    if (!module.references || !module.references[referenceIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Reference not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get file details
    const fs = require('fs');
    const path = require('path');

    // Check if we're in production (using Cloudinary)
    const isProduction = process.env.NODE_ENV === 'production';

    // Get file path and size
    let filePath, fileSize;

    if (isProduction && req.fileUrl) {
      // In production, use the Cloudinary URL
      filePath = req.fileUrl;
      fileSize = req.file.size || 0;

      console.log('Cloudinary file upload details:', {
        originalFilename: req.file.originalname,
        cloudinaryUrl: req.fileUrl,
        fileSize
      });
    } else {
      // In development, use the local file path
      const { uploadsDir } = require('../config/uploadConfig');
      filePath = `/uploads/${req.file.filename}`;
      fileSize = req.file.size || 0;

      console.log('Local file upload details:', {
        originalFilename: req.file.originalname,
        savedFilename: req.file.filename,
        filePath,
        fileSize
      });
    }

    // Create file object with all necessary metadata
    const fileObject = {
      path: filePath,
      fileType: fileType || 'pdf',
      originalName: req.file.originalname,
      size: fileSize,
      uploadedAt: new Date(),
      temporary: true // Mark as temporary until reference is saved
    };

    // Add file to reference
    module.references[referenceIndex].files.push(fileObject);
    await module.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded to reference successfully',
      data: {
        file: fileObject
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

// Helper function to clean up temporary files with retry logic
const cleanupTemporaryFiles = async (retryCount = 0, maxRetries = 3) => {
  try {
    // Skip temporary file cleanup logging

    // Check if database is connected
    if (!global.dbConnected) {
      console.log('Database not connected, skipping temporary file cleanup');
      return;
    }

    // Find all modules with temporary files in chapters, syllabus, or references
    // Use a timeout option to prevent long-running queries
    const findOptions = { maxTimeMS: 30000 }; // 30 second timeout for this query

    try {
      const modules = await Module.find({
        $or: [
          { 'chapters.files.temporary': true },
          { 'syllabus.files.temporary': true },
          { 'references.files.temporary': true }
        ]
      }, null, findOptions);

      if (!modules || modules.length === 0) {
        // Skip no modules found logging
        return;
      }

      // Skip modules found logging

      // Get current time
      const now = new Date();
      // Set cutoff time to 24 hours ago
      const cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));

      // Track changes
      let totalFilesRemoved = 0;

      // Process each module
      for (const module of modules) {
        let moduleModified = false;

        // Process chapters
        if (module.chapters && module.chapters.length > 0) {
          module.chapters.forEach(chapter => {
            if (chapter.files && chapter.files.length > 0) {
              // Get original count
              const originalCount = chapter.files.length;

              // Filter out old temporary files
              chapter.files = chapter.files.filter(file => {
                // Keep if not temporary or if uploaded recently
                return !file.temporary || new Date(file.uploadedAt) > cutoffTime;
              });

              // If files were removed, mark module as modified
              if (chapter.files.length < originalCount) {
                moduleModified = true;
                totalFilesRemoved += (originalCount - chapter.files.length);
              }
            }
          });
        }

        // Process syllabus files
        if (module.syllabus && module.syllabus.files && module.syllabus.files.length > 0) {
          const originalCount = module.syllabus.files.length;

          module.syllabus.files = module.syllabus.files.filter(file => {
            return !file.temporary || new Date(file.uploadedAt) > cutoffTime;
          });

          if (module.syllabus.files.length < originalCount) {
            moduleModified = true;
            totalFilesRemoved += (originalCount - module.syllabus.files.length);
          }
        }

        // Process reference files
        if (module.references && module.references.length > 0) {
          module.references.forEach(reference => {
            if (reference.files && reference.files.length > 0) {
              const originalCount = reference.files.length;

              reference.files = reference.files.filter(file => {
                return !file.temporary || new Date(file.uploadedAt) > cutoffTime;
              });

              if (reference.files.length < originalCount) {
                moduleModified = true;
                totalFilesRemoved += (originalCount - reference.files.length);
              }
            }
          });
        }

        // Save module if modified with a timeout
        if (moduleModified) {
          try {
            await module.save({ maxTimeMS: 15000 }); // 15 second timeout for save operation
          } catch (saveError) {
            console.error(`Error saving module ${module._id} during cleanup:`, saveError);
            // Continue with other modules even if one fails to save
          }
        }
      }

      // Skip cleanup complete logging
    } catch (dbError) {
      // Handle database query errors specifically
      console.error('Database error during cleanup:', dbError);

      // Retry logic for database errors
      if (retryCount < maxRetries) {
        const delayMs = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        // Skip retry logging
        setTimeout(() => cleanupTemporaryFiles(retryCount + 1, maxRetries), delayMs);
      } else {
        console.error(`Failed to clean up temporary files after ${maxRetries + 1} attempts.`);
      }
    }
  } catch (error) {
    console.error('Unexpected error during file cleanup:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupTemporaryFiles, 60 * 60 * 1000);

// Run cleanup on server start
cleanupTemporaryFiles();

module.exports = {
  getAssignedModules,
  getModuleDetails,
  addChapter,
  updateModuleChapters,
  deleteChapter,
  uploadChapterFile,
  updateSyllabus,
  uploadSyllabusFile,
  addReference,
  updateReference,
  deleteReference,
  uploadReferenceFile
};
