const bcryptService = require('../services/bcryptService');
const jwtService = require('../services/jwtService');
const User = require('../models/userModel');
const { matchedData } = require('express-validator');

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = matchedData(req);

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        user = new User({ username, email, password });

        user.password = await bcryptService.hashPassword(password);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = jwtService.generateToken(payload);
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = matchedData(req);

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const isMatch = await bcryptService.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        const token = jwtService.generateToken(payload);
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

module.exports = { registerUser, loginUser };
