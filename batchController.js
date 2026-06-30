const Batch = require('../models/Batch');

// @desc    Get batches (optionally filtered by department)
// @route   GET /api/batches
exports.getBatches = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;

    const batches = await Batch.find(filter)
      .populate('departmentId', 'name code')
      .sort({ startYear: -1, name: 1 });
    res.status(200).json({ success: true, count: batches.length, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create batch
// @route   POST /api/batches
exports.createBatch = async (req, res) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!batch) return res.status(404).json({ success: false, error: 'Batch not found' });
    res.status(200).json({ success: true, data: batch });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, error: 'Batch not found' });
    await batch.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};