const express = require('express');
const { getAllUsers, getUserProfile, updateUserProfile, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { validateUpdateUserProfile } = require('../utils/authValidator');
const validateResult = require('../utils/handleValidator');

const router = express.Router();

router.get('/profile', authMiddleware, getUserProfile);

router.put('/profile', [authMiddleware, validateUpdateUserProfile, validateResult], updateUserProfile);

router.get('/', [authMiddleware, roleMiddleware(['admin'])], getAllUsers);

router.delete('/:id', [authMiddleware, roleMiddleware(['admin'])], deleteUser);

module.exports = router;