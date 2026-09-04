const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: '' }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); return ret; } }
});

module.exports = mongoose.model('Setting', settingSchema);
