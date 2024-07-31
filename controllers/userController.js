const User = require('../models/userModel');
const { matchedData } = require('express-validator');

// Obtener el perfil del usuario autenticado
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err.message);
        res.status(500).send('Server Error');
    }
};

// Actualizar el perfil del usuario autenticado
const updateUserProfile = async (req, res) => {
    try {
        const data = matchedData(req);
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Actualizar campos permitidos
        user.username = data.username || user.username;
        user.email = data.email || user.email;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error('Error updating user profile:', err.message);
        res.status(500).send('Server Error');
    }
};

// Obtener todos los usuarios (solo para administradores)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).send('Server Error');
    }
};

// Eliminar un usuario (solo para administradores)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getUserProfile, getAllUsers, updateUserProfile, deleteUser };
