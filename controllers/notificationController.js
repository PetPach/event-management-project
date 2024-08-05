const { matchedData } = require('express-validator');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const emailService = require('../services/emailService');

/**
 * Enviar notificación de confirmación de registro
 * @param {*} req 
 * @param {*} res 
 */
const sendRegistrationConfirmation = async (req, res) => {
    try {
        const { eventId } = matchedData(req);
        const userId = req.user.id;

        const user = await User.findById(userId);
        const event = await Event.findById(eventId);
        if (!user || !event) {
            return res.status(404).json({ msg: 'Usuario o evento no encontrado' });
        }

        // Crear notificación en la base de datos
        const notification = new Notification({
            userId,
            eventId,
            type: 'confirmation',
            message: `Confirmación de registro para el evento ${event.title}`,
        });
        await notification.save();

        // Enviar correo de confirmación
        await emailService.sendEmail({
            to: user.email,
            subject: `Confirmación de registro para el evento ${event.title}`,
            text: `Has sido registrado exitosamente para el evento ${event.title} que se llevará a cabo el ${event.date}.`
        });

        res.status(200).json({ msg: 'Correo de confirmación enviado y notificación registrada.' });
    } catch (error) {
        console.error('Error enviando confirmación de registro:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Enviar recordatorio de evento
 * @param {*} req 
 * @param {*} res 
 */
const sendEventReminder = async (req, res) => {
    try {
        const { eventId } = matchedData(req);
        const event = await Event.findById(eventId).populate('attendees', 'email');
        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        for (let attendee of event.attendees) {
            // Crear notificación en la base de datos
            const notification = new Notification({
                userId: attendee._id,
                eventId: event._id,
                type: 'reminder',
                message: `Recordatorio del evento ${event.title}`,
            });
            await notification.save();

            // Enviar correo de recordatorio
            await emailService.sendEmail({
                to: attendee.email,
                subject: `Recordatorio del evento ${event.title}`,
                text: `Este es un recordatorio para el evento ${event.title} que se llevará a cabo el ${event.date}.`
            });
        }

        res.status(200).json({ msg: 'Recordatorios enviados y notificaciones registradas.' });
    } catch (error) {
        console.error('Error enviando recordatorio de evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Enviar notificación de actualización de evento
 * @param {*} req 
 * @param {*} res 
 */
const sendEventUpdate = async (req, res) => {
    try {
        const { eventId } = matchedData(req);
        const event = await Event.findById(eventId).populate('attendees', 'email');
        if (!event) {
            return res.status(404).json({ msg: 'Evento no encontrado' });
        }

        for (let attendee of event.attendees) {
            // Crear notificación en la base de datos
            const notification = new Notification({
                userId: attendee._id,
                eventId: event._id,
                type: 'update',
                message: `Actualización del evento ${event.title}`,
            });
            await notification.save();

            // Enviar correo de actualización
            await emailService.sendEmail({
                to: attendee.email,
                subject: `Actualización del evento ${event.title}`,
                text: `El evento ${event.title} ha sido actualizado. Por favor, revise los nuevos detalles.`
            });
        }

        res.status(200).json({ msg: 'Actualizaciones enviadas y notificaciones registradas.' });
    } catch (error) {
        console.error('Error enviando actualización de evento:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Obtener todas las notificaciones de un usuario
 * @param {*} req 
 * @param {*} res 
 */
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId }).populate('eventId', 'title');

        res.json(notifications);
    } catch (error) {
        console.error('Error obteniendo notificaciones del usuario:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

/**
 * Crear una notificación personalizada
 * @param {*} req 
 * @param {*} res 
 */
const createCustomNotification = async (req, res) => {
    try {
        const { userId, message } = matchedData(req);
        const adminId = req.user.id;

        // Verificar si el remitente es un administrador
        const admin = await User.findById(adminId);
        if (admin.role !== 'admin') {
            return res.status(403).json({ msg: 'No tiene permisos para enviar notificaciones personalizadas' });
        }

        // Crear notificación en la base de datos sin eventId
        const notification = new Notification({
            userId,
            type: 'custom', // Asegura que el tipo 'custom' esté soportado en el modelo
            message,
        });
        await notification.save();

        // Obtener el correo electrónico del destinatario
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Enviar correo de notificación personalizada
        await emailService.sendEmail({
            to: user.email,
            subject: 'Notificación personalizada',
            text: message
        });

        res.status(200).json({ msg: 'Notificación personalizada enviada y registrada.' });
    } catch (error) {
        console.error('Error enviando notificación personalizada:', error);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

module.exports = {
    sendRegistrationConfirmation,
    sendEventReminder,
    sendEventUpdate,
    getUserNotifications,
    createCustomNotification,
};
