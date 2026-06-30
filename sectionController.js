const Section = require('../models/Section');

// @desc    Get sections (optionally filtered by batch)
// @route   GET /api/sections
exports.getSections = async (req, res) => {
  try {
    const filter = {};
    if (req.query.batchId) filter.batchId = req.query.batchId;

    const sections = await Section.find(filter)
      .populate('batchId', 'name')
      .populate('advisorId', 'name email')
      .sort({ semester: 1, name: 1 });
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create section
// @route   POST /api/sections
exports.createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!section) return res.status(404).json({ success: false, error: 'Section not found' });
    res.status(200).json({ success: true, data: section });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, error: 'Section not found' });
    await section.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};