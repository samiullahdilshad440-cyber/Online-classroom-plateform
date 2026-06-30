const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { createNotification } = require('./notificationController');

// @desc    Get announcements for a course
// @route   GET /api/announcements/course/:courseId
exports.getAnnouncementsByCourse = async (req, res) => {
  try {
    const announcements = await Announcement.find({ courseId: req.params.courseId })
      .populate('authorId', 'name')
      .sort({ pinned: -1, createdAt: -1 });

    res.status(200).json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create announcement (Teacher)
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res) => {
  try {
    const { courseId, title, body, pinned } = req.body;

    // Verify teacher owns the course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const announcement = await Announcement.create({
      courseId,
      authorId: req.user.id,
      title,
      body,
      pinned: pinned || false
    });

    // Notify all enrolled students
    const io = req.app.get('io');
    const enrollments = await Enrollment.find({ courseId }).select('studentId');
    
    for (const enrollment of enrollments) {
      await createNotification(
        enrollment.studentId,
        'announcement',
        `New announcement in ${course.title}: ${title}`,
        io
      );
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, error: 'Announcement not found' });

    const course = await Course.findById(announcement.courseId);
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await announcement.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};