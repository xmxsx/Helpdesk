const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const ticketRoutes = require('./routes/ticketRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/helpdesk';

mongoose.connect(mongoURI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
