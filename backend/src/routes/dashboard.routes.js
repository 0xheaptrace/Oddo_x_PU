const express = require('express');
const dashboard = require('../controllers/dashboard.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired);

router.get('/summary', dashboard.summary);

module.exports = router;
