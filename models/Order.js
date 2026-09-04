const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true, default: 1 },
  size: { type: String, default: '' },
  image_url: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  legacy_id: { type: Number },
  order_number: { type: String, required: true, unique: true },
  customer_name: { type: String, default: 'Online Customer' },
  customer_phone: { type: String, default: '' },
  customer_address: { type: String, default: '' },
  customer_notes: { type: String, default: '' },
  items: [orderItemSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total_amount: { type: Number, required: true, default: 0 },
  promo_code: { type: String, default: '' },
  payment_method: { type: String, default: 'Cash on Delivery' },
  status: { type: String, default: 'completed', enum: ['pending', 'processing', 'completed', 'cancelled'] },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); return ret; } }
});

module.exports = mongoose.model('Order', orderSchema);
