require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/products'); // adjust if your path is different

async function updateRetailerProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const retailerId = '683694a3c9bb7ee004ca1ebb';

    // Update all 'men' category products with this retailer ID
    const result = await Product.updateMany(
      { category: 'kid' },
      { $set: { retailer_id: retailerId } }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
  } catch (err) {
    console.error("❌ Error updating products:", err.message);
  } finally {
    mongoose.disconnect();
  }
}

updateRetailerProducts();
