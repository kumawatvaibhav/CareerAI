const Resume = require('../models/Resume');

exports.getResumes = async (req, res) => {
  const resumes = await Resume.find({ user: req.user.id });
  res.json(resumes);
};

exports.getResumeById = async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });
  res.json(resume);
};

exports.createResume = async (req, res) => {
  const resume = new Resume({ ...req.body, user: req.user.id });
  await resume.save();
  res.status(201).json(resume);
};

exports.updateResume = async (req, res) => {
  const resume = await Resume.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
  if (!resume) return res.status(404).json({ message: 'Resume not found' });
  res.json(resume);
};

exports.deleteResume = async (req, res) => {
  const result = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!result) return res.status(404).json({ message: 'Resume not found' });
  res.json({ message: 'Deleted successfully' });
};
