const Chat = require('../models/Chat');

exports.createChat = async (req, res) => {
  const { topic, messages } = req.body;
  const newChat = new Chat({ user: req.user.id, topic, messages });
  await newChat.save();
  res.status(201).json(newChat);
};

exports.getAllChats = async (req, res) => {
  const chats = await Chat.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(chats);
};

exports.getChatById = async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json(chat);
};

exports.deleteChat = async (req, res) => {
  const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  res.json({ message: 'Chat deleted successfully' });
};
