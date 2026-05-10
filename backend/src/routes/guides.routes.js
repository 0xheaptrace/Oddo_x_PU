const express = require('express');
const guides = require('../controllers/guides.controller');

const router = express.Router();

// GET /api/guides/city?city=Mumbai  OR /api/guides/city/mumbai
router.get('/city', guides.cityGuide);
router.get('/city/:city', guides.cityGuide);

module.exports = router;

