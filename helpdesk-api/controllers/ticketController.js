const Ticket = require('../models/Ticket');;

function generateTicketId() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `#${randomNumber}`;
}

exports.createTicket = async (req, res) => {
  try {
    const newTicket = new Ticket({
      ...req.body,
      ticketId: generateTicketId(),
    });
    await newTicket.save();

    if (req.body.email) {
      sendEmail(req.body.email, 'New Ticket Created', `Your ticket with ID ${newTicket.ticketId} has been created.`);
    }

    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTicketById = async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTicket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.body.email) {
      sendEmail(req.body.email, 'Ticket Updated', `Your ticket with ID ${updatedTicket.ticketId} has been updated.`);
    }

    res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTicketById = async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);
    if (!deletedTicket) return res.status(404).json({ error: 'Ticket not found' });

    if (req.body.email) {
      sendEmail(req.body.email, 'Ticket Deleted', `Your ticket with ID ${deletedTicket.ticketId} has been deleted.`);
    }

    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.notifyUser = async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    await sendEmail(to, subject, text);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
