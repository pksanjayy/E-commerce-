const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['women', 'men', 'kid'], required: true },
    image: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number },
    retailer_stock: { type: Number, default: 0 },
    shopper_stock: { type: Number, default: 0 },
    retailer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Product', productSchema);