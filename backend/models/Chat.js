const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topic: String,
  messages: [
    {
      role: String, // 'user' or 'assistant'
      content: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
