const mongoose = require('mongoose');

const allOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: Number,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: { type: String, default: 'Processing' },
  orderedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AllOrder', allOrderSchema);
