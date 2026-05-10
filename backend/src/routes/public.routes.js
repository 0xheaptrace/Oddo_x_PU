const express = require('express');
const trips = require('../controllers/trips.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/trips', trips.listPublicTrips);
router.get('/trips/:slug', trips.publicTrip); // limited payload
router.get('/trips/:slug/details', authRequired, trips.publicTripDetails); // full payload if approved/owner (or unlisted password)
router.post('/trips/:slug/request', authRequired, trips.requestTripAccess);

module.exports = router;
