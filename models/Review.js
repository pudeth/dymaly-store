const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  legacy_id: { type: Number },
  product_id: { type: String, required: true },
  customer_name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); return ret; } }
});

module.exports = mongoose.model('Review', reviewSchema);
