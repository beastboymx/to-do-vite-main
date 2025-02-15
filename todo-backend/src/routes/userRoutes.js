const express = require('express');
const { registerUser, getUserByEmail, getAllUsers } = require('../controllers/userController');

const router = express.Router();

//ruta para registrar un usuario
router.post('/register', registerUser);

module.exports = router;