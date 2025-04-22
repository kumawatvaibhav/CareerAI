// models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'minimal'],
    default: 'modern'
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String },
    summary: { type: String }
  },
  experience: [{
    company: { type: String },
    position: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String }
  }],
  education: [{
    institution: { type: String },
    degree: { type: String },
    field: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    gpa: { type: String }
  }],
  skills: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);

module.exports = Resume;