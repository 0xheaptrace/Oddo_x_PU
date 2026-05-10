const express = require('express');
const auth = require('../controllers/auth.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/register', auth.registerValidators, auth.register);
router.post('/login', auth.loginValidators, auth.login);
router.post('/forgot-password', auth.forgotValidators, auth.forgotPassword);
router.post('/reset-password', auth.resetValidators, auth.resetPassword);
router.get('/me', authRequired, auth.me);

module.exports = router;
