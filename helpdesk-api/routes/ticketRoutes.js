const express = require('express');
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
  notifyUser
} = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

router.post('/', authMiddleware, createTicket);
router.get('/', authMiddleware, getTickets);
router.get('/:id', authMiddleware, getTicketById);
router.put('/:id', authMiddleware, updateTicketById);
router.delete('/:id', authMiddleware, deleteTicketById);
router.post('/notify', authMiddleware, notifyUser);

module.exports = router;
