const { matchedData } = require('express-validator');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');

/**
 * Crear un nuevo evento
 * @param {*} req 
 * @param {*} res 
 */
const createEvent = async (req, res) => {
    try {
        const eventData = matchedData(req);
        eventData.organizer = req.user.id;

        const newEvent = new Event(eventData);
        await newEvent.save();
        res.status(201).json({ msg: 'Evento creado exitosamente', event: newEvent });
    } catch (error) {
        console.error('Error creando evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Obtener todos los eventos
 * @param {*} req 
 * @param {*} res 
 */
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'username email');
        res.json(events);
    } catch (error) {
        console.error('Error obteniendo eventos:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Obtener un evento por ID
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getEventById = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const event = await Event.findById(id).populate('organizer', 'username email');
        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error obteniendo evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Actualizar un evento
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eventData = matchedData(req);
        let event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        // Verificar que el usuario sea el organizador o un administrador
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'No tiene permisos para actualizar este evento' });
        }

        // Actualizar los campos con los datos validados
        Object.assign(event, eventData);

        await event.save();
        res.json({ msg: 'Evento actualizado', event });
    } catch (error) {
        console.error('Error actualizando evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Eliminar un evento
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const deleteEvent = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        // Verificar que el usuario sea el organizador o un administrador
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'No tiene permisos para eliminar este evento' });
        }

        await event.deleteOne();
        res.json({ msg: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};


module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
