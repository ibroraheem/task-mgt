// routes/authRoutes.js
const express = require('express');
const passport = require('../middlewares/passportConfig');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password', resetPassword);

module.exports = router;
