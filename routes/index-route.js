const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index-controller');
const chatController = require('../controllers/chat-controller');

router.get('/',indexController);
router.get('/chat',chatController);

module.exports = router;