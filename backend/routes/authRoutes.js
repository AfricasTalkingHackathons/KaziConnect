const express = require('express');
const { registerUser, loginUser, getEscrows } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/escrows', getEscrows);

module.exports = router;
