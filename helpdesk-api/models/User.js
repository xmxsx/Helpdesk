const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  userId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  this.userId = await generateUniqueUserId();
  next();
});

UserSchema.pre('insertMany', async function(next, docs) {
  for (let doc of docs) {
    doc.userId = await generateUniqueUserId();
  }
  next();
});

UserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

async function generateUniqueUserId() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const userId = `#${randomNumber}`;
  const existingUser = await mongoose.models.User.findOne({ userId });
  if (existingUser) {
    return generateUniqueUserId(); 
  }
  return userId;
}

module.exports = mongoose.model('User', UserSchema);
