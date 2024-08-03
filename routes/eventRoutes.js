const express = require('express');
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateCreateEvent, validateUpdateEvent, validateEventId } = require('../utils/eventValidator');
const validateResult = require('../utils/handleValidator');

const router = express.Router();

// Ruta para crear un evento (requiere autenticación)
router.post('/', [authMiddleware, validateCreateEvent, validateResult], createEvent);

// Ruta para obtener todos los eventos (require autenticación)
router.get('/', authMiddleware, getAllEvents);

// Ruta para obtener un evento por ID
router.get('/:id', [authMiddleware, validateEventId, validateResult], getEventById);

// Ruta para actualizar un evento (requiere autenticación y autorización)
router.put('/:id', [authMiddleware, validateUpdateEvent, validateResult], updateEvent);

// Ruta para eliminar un evento (requiere autenticación y autorización)
router.delete('/:id', [authMiddleware, validateEventId, validateResult], deleteEvent);

module.exports = router;
