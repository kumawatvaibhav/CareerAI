const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  title: String,
  content: Object,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
