const Dashboard = require('../models/Dashboard');

exports.getDashboard = async (req, res) => {
  let dashboard = await Dashboard.findOne({ user: req.user.id });
  if (!dashboard) {
    dashboard = new Dashboard({ user: req.user.id, stats: {}, activity: [] });
    await dashboard.save();
  }
  res.json(dashboard);
};

exports.updateDashboard = async (req, res) => {
  const updated = await Dashboard.findOneAndUpdate(
    { user: req.user.id },
    req.body,
    { new: true, upsert: true }
  );
  res.json(updated);
};
