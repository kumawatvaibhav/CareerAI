const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getDashboard,
  updateDashboard
} = require('../controllers/dashboardController');

router.route('/')
  .get(protect, getDashboard)
  .put(protect, updateDashboard);

module.exports = router;
