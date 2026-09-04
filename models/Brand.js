const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  legacy_id: { type: Number },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  logo_url: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); return ret; } }
});

module.exports = mongoose.model('Brand', brandSchema);
