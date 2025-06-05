const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: Number,
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  total: Number,
  status: { type: String, default: 'Processing' },
  orderedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
