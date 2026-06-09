const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const [
      total,
      byStatus,
      bySource,
      byPriority,
      recent,
      totalValue
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Lead.find().sort('-createdAt').limit(5).select('name email status source createdAt priority'),
      Lead.aggregate([{ $match: { status: 'Converted' } }, { $group: { _id: null, total: { $sum: '$value' } } }])
    ]);

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const newThisMonth = await Lead.countDocuments({ createdAt: { $gte: last30 } });

    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      total,
      newThisMonth,
      converted: statusMap['Converted'] || 0,
      conversionRate: total > 0 ? Math.round(((statusMap['Converted'] || 0) / total) * 100) : 0,
      totalValue: totalValue[0]?.total || 0,
      byStatus: statusMap,
      bySource: bySource.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      byPriority: byPriority.reduce((acc, p) => { acc[p._id] = p.count; return acc; }, {}),
      recentLeads: recent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
