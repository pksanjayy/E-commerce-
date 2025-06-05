require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/products');

async function updateImagePaths() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected");

    const result = await Product.updateMany(
      {},
      [{ $set: { image: { $concat: ["/images/", "$image"] } } }]
    );

    console.log(`✅ Updated ${result.modifiedCount} product image paths.`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    mongoose.disconnect();
  }
}

updateImagePaths();
