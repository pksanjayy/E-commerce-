require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('../models/products'); 
const all_products = require('./all_products');

async function importProducts() {
    try {
        console.log("Connecting to MongoDB...");
        
        
        await mongoose.connect(process.env.MONGO_URL);
        console.log(" MongoDB connected");

        
        console.log("Product model:", Product); 
        
        const productsToImport = all_products.map(product => ({
            ...product,
            retailer_stock: 100,
            shopper_stock: 50,
            retailer_id: null
        }));

        
        console.log("Clearing existing products...");
        await Product.deleteMany({});
        
        
        console.log("Inserting products...");
        const result = await Product.insertMany(productsToImport);
        
        console.log(`Success! Inserted ${result.length} products`);
        process.exit(0);
    } catch (err) {
        console.error("Import failed:", err.message);
        process.exit(1);
    } finally {
        mongoose.disconnect();
    }
}

importProducts();
