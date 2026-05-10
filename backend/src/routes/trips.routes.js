const express = require('express');
const trips = require('../controllers/trips.controller');
const itinerary = require('../controllers/itinerary.controller');
const budget = require('../controllers/budget.controller');
const packing = require('../controllers/packing.controller');
const notes = require('../controllers/notes.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired);

router.get('/', trips.listTrips);
router.post('/', trips.createTrip);

router.get('/:tripId', trips.getTrip);
router.patch('/:tripId', trips.updateTrip);
router.delete('/:tripId', trips.deleteTrip);
router.post('/:tripId/duplicate', trips.duplicateTrip);
router.post('/:tripId/share', trips.shareTrip);
router.get('/:tripId/requests', trips.listTripRequests);
router.patch('/:tripId/requests/:requestId', trips.respondTripRequest);

router.get('/:tripId/stops', itinerary.listStops);
router.post('/:tripId/stops', itinerary.createStop);
router.post('/:tripId/stops/from-destination/:destinationId', itinerary.addStopFromDestination);
router.patch('/:tripId/stops/reorder', itinerary.reorderStops);
router.patch('/:tripId/stops/:stopId', itinerary.updateStop);
router.delete('/:tripId/stops/:stopId', itinerary.deleteStop);

router.post('/:tripId/stops/:stopId/activities', itinerary.createActivity);
router.post(
  '/:tripId/stops/:stopId/activities/from-browse/:browseActivityId',
  itinerary.addActivityFromBrowse,
);
router.patch('/:tripId/stops/:stopId/activities/:activityId', itinerary.updateActivity);
router.delete('/:tripId/stops/:stopId/activities/:activityId', itinerary.deleteActivity);

router.get('/:tripId/budget', budget.listBudget);
router.post('/:tripId/budget', budget.createBudgetLine);
router.patch('/:tripId/budget/:lineId', budget.updateBudgetLine);
router.delete('/:tripId/budget/:lineId', budget.deleteBudgetLine);

router.get('/:tripId/packing', packing.listPacking);
router.post('/:tripId/packing/:listId/items', packing.createPackingItem);
router.patch('/:tripId/packing/:listId/items/:itemId', packing.updatePackingItem);
router.delete('/:tripId/packing/:listId/items/:itemId', packing.deletePackingItem);
router.post('/:tripId/packing/:listId/template', packing.applyTemplate);

router.get('/:tripId/notes', notes.listNotes);
router.post('/:tripId/notes', notes.createNote);
router.patch('/:tripId/notes/:noteId', notes.updateNote);
router.delete('/:tripId/notes/:noteId', notes.deleteNote);

module.exports = router;
