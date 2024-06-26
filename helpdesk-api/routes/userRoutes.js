const express = require('express');
const { updateUserRole, deleteUser, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.put('/:id/role', authMiddleware, updateUserRole);

router.delete('/:id', authMiddleware, deleteUser);

router.get('/', authMiddleware, getAllUsers);

module.exports = router;
