const express = require('express');
const trips = require('../controllers/trips.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/trips/:slug/copy', authRequired, trips.copyPublicTrip);

module.exports = router;
