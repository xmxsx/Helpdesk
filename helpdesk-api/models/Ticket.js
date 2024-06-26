const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in progress', 'closed'], default: 'open' },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

ticketSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
