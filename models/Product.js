const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  legacy_id: { type: Number },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, default: 'Smartphones' },
  price: { type: Number, required: true },
  size: { type: String, default: '256GB' },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); return ret; } }
});

module.exports = mongoose.model('Product', productSchema);
