const User = require('../models/userModel');
const { matchedData } = require('express-validator');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error obteniendo perfil de usuario:', err.message);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const data = matchedData(req);
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        user.username = data.username || user.username;
        user.email = data.email || user.email;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error actualizando perfil de usuario:', err.message);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Error obteniendo usuarios:', err.message);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id });

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({ msg: 'Usuario eliminado exitosamente' });
    } catch (err) {
        console.error('Error eliminando usuario:', err.message);
        res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
    }
};

module.exports = { getUserProfile, getAllUsers, updateUserProfile, deleteUser };
