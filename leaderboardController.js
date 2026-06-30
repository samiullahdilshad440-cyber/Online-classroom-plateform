const User = require('../models/User');

// @desc    Get leaderboard (Top 50)
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    // SECRET REQ #4: Live aggregation over User.totalPoints (denormalized from PointsLog)
    // No stored "rank" field — we sort at read time
    const leaderboard = await User.find({ totalPoints: { $gt: 0 } })
      .select('name totalPoints profile.avatar')
      .sort({ totalPoints: -1 })
      .limit(50);

    // Add rank dynamically (not stored in DB)
    const ranked = leaderboard.map((user, idx) => ({
      rank: idx + 1,
      name: user.name,
      totalPoints: user.totalPoints,
      avatar: user.profile.avatar
    }));

    res.status(200).json({ success: true, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};