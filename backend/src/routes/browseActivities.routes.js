const express = require('express');
const browseActivities = require('../controllers/browseActivities.controller');

const router = express.Router();

router.get('/', browseActivities.listBrowseActivities);

module.exports = router;
