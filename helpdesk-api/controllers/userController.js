const User = require('../models/User');

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userToUpdate = await User.findById(req.params.id);
    console.log(`Attempting to update role for user with id: ${req.params.id}`);

    if (!userToUpdate) {
      console.error(`User not found with id: ${req.params.id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToUpdate.role === 'admin' && role !== 'admin') {
      console.error('Cannot change role of another admin');
      return res.status(403).json({ error: 'Cannot change role of another admin' });
    }

    userToUpdate.role = role;
    userToUpdate.updatedAt = Date.now();
    await userToUpdate.save();
    console.log(`Successfully updated role for user with id: ${req.params.id} to ${role}`);

    res.json(userToUpdate);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    const requestingUserId = req.user.id; 
    console.log(`Attempting to delete user with id: ${req.params.id}`);

    if (!userToDelete) {
      console.error(`User not found with id: ${req.params.id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.role === 'admin' && userToDelete.id !== requestingUserId) {
      console.error('Cannot delete another admin');
      return res.status(403).json({ error: 'Cannot delete another admin' });
    }

    console.log(`Deleting user with id: ${req.params.id}`);
    await User.deleteOne({ _id: req.params.id });
    console.log(`Successfully deleted user with id: ${req.params.id}`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users');
    const users = await User.find();
    console.log(`Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};
