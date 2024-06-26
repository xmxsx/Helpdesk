const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.register = async (req, res) => {
  const { email, password, role } = req.body;
  console.log(`Register request received with email: ${email}, role: ${role}`);
  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email: email.toLowerCase(), password: hashedPassword, role });
    await user.save();
    console.log(`User created with role: ${user.role}`);

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('User registered successfully');
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login request received with email: ${email}`);
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`Invalid credentials - user not found: ${email}`);
      return res.status(400).json({ message: 'That email and password combination is incorrect.' });
    }

    console.log(`User found: ${user.email} with role: ${user.role}`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid credentials - password mismatch for ${email}`);
      return res.status(400).json({ message: 'That email and password combination is incorrect.' });
    }

    console.log(`User role during login: ${user.role}`);
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`User ${email} logged in successfully`);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
};
