const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/analytics', auth, getAnalytics);

module.exports = router;
