const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createChat,
  getAllChats,
  deleteChat,
  getChatById
} = require('../controllers/chatController');

router.route('/')
  .post(protect, createChat)
  .get(protect, getAllChats);

router.route('/:id')
  .get(protect, getChatById)
  .delete(protect, deleteChat);

module.exports = router;
