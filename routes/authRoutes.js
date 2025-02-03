const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cors = require('cors');

router.options('*', cors()); // Ajoutez cette ligne
router.post('/login', authController.login);
router.post('/register', authController.register);


module.exports = router;