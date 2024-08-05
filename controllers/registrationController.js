const { matchedData } = require('express-validator');
const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');

/**
 * Registrar a un usuario en un evento
 * @param {*} req 
 * @param {*} res 
 */
const registerUserForEvent = async (req, res) => {
    try {
        const { eventId } = matchedData(req);
        const userId = req.user.id;

        // Verificar la existencia del evento
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        // Verificar si el usuario ya está registrado en el evento
        const existingRegistration = await Registration.findOne({ eventId, userId });
        if (existingRegistration) {
            return res.status(400).json({ msg: 'Ya está registrado en este evento' });
        }

        // Verificar disponibilidad de cupos
        if (event.attendees.length >= event.capacity) {
            return res.status(400).json({ msg: 'No hay cupos disponibles para este evento' });
        }

        // Crear nuevo registro de inscripción
        const registration = new Registration({ eventId, userId, status: 'confirmed' });
        await registration.save();

        // Añadir al usuario a la lista de asistentes del evento
        event.attendees.push(userId);
        await event.save();

        res.status(201).json({ msg: 'Registrado en el evento exitosamente', registration });
    } catch (error) {
        console.error('Error registrando al usuario en el evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Cancelar registro de un usuario
 * @param {*} req 
 * @param {*} res 
 */
const cancelRegistration = async (req, res) => {
    try {
        const { eventId } = matchedData(req);
        const userId = req.user.id;

        // Verificar si la inscripción existe
        const registration = await Registration.findOne({ eventId, userId });
        if (!registration) {
            return res.status(404).json({ msg: 'Registro no encontrado' });
        }

        // Verificar la existencia del evento
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        // Eliminar la inscripción y actualizar la lista de asistentes
        await registration.deleteOne();
        event.attendees = event.attendees.filter(attendee => attendee.toString() !== userId);
        await event.save();

        res.json({ msg: 'Registro cancelado exitosamente' });
    } catch (error) {
        console.error('Error cancelando el registro:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Obtener la lista de registros de un usuario
 * @param {*} req 
 * @param {*} res 
 */
const getUserRegistrations = async (req, res) => {
    try {
        const userId = req.user.id;
        const registrations = await Registration.find({ userId }).populate('eventId', 'title description date');

        res.json(registrations);
    } catch (error) {
        console.error('Error obteniendo registros del usuario:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Obtener la lista de inscritos de un evento
 * @param {*} req 
 * @param {*} res 
 */
const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = matchedData(req);
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        // Verificar que el usuario sea el organizador o un administrador
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'No tiene permisos para ver los registros de este evento' });
        }

        const registrations = await Registration.find({ eventId }).populate('userId', 'username email');
        res.json(registrations);
    } catch (error) {
        console.error('Error obteniendo registros del evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

module.exports = { registerUserForEvent, cancelRegistration, getUserRegistrations, getEventRegistrations, };
