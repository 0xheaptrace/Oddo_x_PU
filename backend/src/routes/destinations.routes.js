const express = require('express');
const destinations = require('../controllers/destinations.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', destinations.listDestinations);

router.post('/:destinationId/save', authRequired, destinations.saveDestination);
router.delete('/:destinationId/save', authRequired, destinations.unsaveDestination);

module.exports = router;
