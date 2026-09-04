const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  legacy_id: { type: Number },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  display_name: { type: String, default: 'Store Administrator' },
  email: { type: String, default: 'admin@bongstore.com' },
  phone: { type: String, default: '+855 12 345 678' },
  avatar_url: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); return ret; } }
});

module.exports = mongoose.model('User', userSchema);
