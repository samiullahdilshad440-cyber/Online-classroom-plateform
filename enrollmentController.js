const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
exports.enrollCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courseId = req.params.courseId;

    // Check if already enrolled
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) return res.status(400).json({ success: false, error: 'Already enrolled' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

    // 1. Create the source-of-truth Enrollment document
    const enrollment = await Enrollment.create({ studentId, courseId });

    // 2. Push the denormalized snapshot to the User document (Q1)
    await User.findByIdAndUpdate(studentId, {
      $push: {
        enrolledCourses: {
          courseId: course._id,
          title: course.title,
          progressPercent: 0,
        },
      },
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update lesson progress (SECRET REQ #2)
// @route   PATCH /api/enrollments/:courseId/progress
exports.updateProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courseId = req.params.courseId;
    const { lessonId } = req.body;

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) return res.status(404).json({ success: false, error: 'Not enrolled' });

    // Add lesson to completed list if not already there
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // Calculate total lessons in the course to get accurate percentage
    const course = await Course.findById(courseId);
    const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    
    const newPercent = totalLessons > 0 
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100) 
      : 0;

    enrollment.progressPercent = newPercent;
    if (newPercent === 100) enrollment.status = 'completed';
    
    await enrollment.save();

    // Sync the denormalized subset on the User document silently
    await User.findByIdAndUpdate(studentId, {
      $set: { 'enrolledCourses.$[elem].progressPercent': newPercent }
    }, {
      arrayFilters: [{ 'elem.courseId': courseId }]
    });

    res.status(200).json({ success: true, data: { progressPercent: newPercent } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get my enrolled courses (Student Dashboard - Q1)
// @route   GET /api/enrollments/my-courses
exports.getMyCourses = async (req, res) => {
  try {
    // Read directly from the denormalized subset for blazing fast dashboard loads
    const user = await User.findById(req.user.id).select('enrolledCourses');
    res.status(200).json({ success: true, data: user.enrolledCourses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};