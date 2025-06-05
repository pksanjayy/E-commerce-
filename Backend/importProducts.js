require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('../models/products'); // Fixed import path
const all_products = require('./all_products');

async function importProducts() {
    try {
        console.log("Connecting to MongoDB...");
        
        // Updated connection without deprecated options
        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB connected");

        // Verify Product model is accessible
        console.log("Product model:", Product); // Debug line
        
        const productsToImport = all_products.map(product => ({
            ...product,
            retailer_stock: 100,
            shopper_stock: 50,
            retailer_id: null
        }));

        // First clear existing products
        console.log("Clearing existing products...");
        await Product.deleteMany({});
        
        // Then insert new ones
        console.log("Inserting products...");
        const result = await Product.insertMany(productsToImport);
        
        console.log(`✅ Success! Inserted ${result.length} products`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Import failed:", err.message);
        process.exit(1);
    } finally {
        mongoose.disconnect();
    }
}

importProducts();