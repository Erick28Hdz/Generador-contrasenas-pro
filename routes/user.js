const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta POST para registrar un nuevo usuario
router.post('/', userController.registerUser);

// Ruta PUT para actualizar la membresía (plan) del usuario
router.put('/:correo', userController.updateUserPlan);

// Ruta GET para consultar usuario por correo
router.get('/:correo', userController.getUserByEmail);

module.exports = router;