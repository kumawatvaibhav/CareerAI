const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stats: Object,
  activity: Array,
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);
