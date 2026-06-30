const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');

// @desc    Submit assignment (Student)
// @route   POST /api/submissions
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const studentId = req.user.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, error: 'Assignment not found' });

    // Check if already submitted
    const existing = await Submission.findOne({ assignmentId, studentId });
    if (existing) return res.status(400).json({ success: false, error: 'Already submitted' });

    // Check if enrolled
    const enrollment = await Enrollment.findOne({ studentId, courseId: assignment.courseId });
    if (!enrollment) return res.status(403).json({ success: false, error: 'Not enrolled in this course' });

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!fileUrl) return res.status(400).json({ success: false, error: 'File is required' });

    const submission = await Submission.create({
      assignmentId,
      studentId,
      courseId: assignment.courseId,
      fileUrl
    });

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get my submissions for a course (Student)
// @route   GET /api/submissions/my/:courseId
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      courseId: req.params.courseId,
      studentId: req.user.id
    }).populate('assignmentId', 'title dueDate maxPoints');

    res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Grade submission (Teacher)
// @route   PATCH /api/submissions/:id/grade
exports.gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) return res.status(404).json({ success: false, error: 'Submission not found' });

    // Verify teacher owns the course
    const assignment = await Assignment.findById(submission.assignmentId);
    const Course = require('../models/Course');
    const course = await Course.findById(assignment.courseId);
    
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // SECRET REQ #3: Grade is embedded, so it's available immediately
    submission.grade = {
      score,
      feedback,
      gradedBy: req.user.id,
      gradedAt: new Date()
    };

    await submission.save();
    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all submissions for a course (Teacher - Gradebook)
// @route   GET /api/submissions/course/:courseId
exports.getCourseSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ courseId: req.params.courseId })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title maxPoints dueDate')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};