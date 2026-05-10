const express = require('express');
const user = require('../controllers/user.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired);

router.get('/me', user.getProfile);
router.patch('/me', user.updateProfile);
router.delete('/me', user.deleteAccount);

module.exports = router;
