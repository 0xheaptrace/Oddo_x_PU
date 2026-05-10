const express = require('express');
const admin = require('../controllers/admin.controller');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, adminOnly);

router.get('/analytics', admin.analytics);

module.exports = router;
