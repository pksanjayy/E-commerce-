const router = require("express").Router();
const Product = require("../models/products");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");

function verifyRetailer(req, res, next) {
    let token = req.header("authorization");
    if (!token) return res.status(401).send({ message: "Access Denied" });

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trim();
    }

    try {
        const verified = jwt.verify(token, process.env.JWTPRIVATEKEY);
        if (verified.role !== "retailer")
            return res.status(403).send({ message: "Retailer access only" });

        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send({ message: "Invalid Token", err: err.message });
    }
}


router.get("/products", verifyRetailer, async (req, res) => {
    try {
        const retailer = await User.findById(req.user._id);
        if (!retailer) return res.status(404).send({ message: "Retailer not found" });

        
        const domain = retailer.email.split('@')[0].toLowerCase();
        let category;
        if (domain.includes('women')) category = 'women';
        else if (domain.includes('men')) category = 'men';
        else if (domain.includes('kids') || domain.includes('kid')) category = 'kid';
        

        console.log("Retailer ID:", req.user._id);
        console.log("Email domain:", retailer.email);
        console.log("Category:", category);


        const products = await Product.find({ 
            category: category,
            retailer_id: req.user._id 
        });
        console.log("Products found:", products.length);
        res.send(products);
    } catch (err) {
        res.status(500).send({ message: "Error fetching products", error: err.message });
    }
});


router.post("/products", verifyRetailer, async (req, res) => {
    try {
        const retailer = await User.findById(req.user._id);
        if (!retailer) return res.status(404).send({ message: "Retailer not found" });

        
        const domain = retailer.email.split('@')[0].toLowerCase();
        let category;
        if (domain.includes('women')) category = 'women';
        else if (domain.includes('men')) category = 'men';
        else if (domain.includes('kids') || domain.includes('kid')) category = 'kid';
        else return res.status(400).send({ message: "Invalid retailer email format" });

        
        const maxIdProduct = await Product.findOne().sort('-id').exec();
        const newId = maxIdProduct ? maxIdProduct.id + 1 : 1;

        const product = new Product({
            ...req.body,
            id: newId,
            category: category,
            retailer_id: req.user._id
        });

        await product.save();
        res.status(201).send({ message: "Product added successfully", product });
    } catch (err) {
        res.status(500).send({ message: "Error adding product", error: err.message });
    }
});


router.put("/products/:id", verifyRetailer, async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { id: req.params.id, retailer_id: req.user._id },
            req.body,
            { new: true }
        );
        
        if (!product) return res.status(404).send({ message: "Product not found or not owned by retailer" });
        res.send({ message: "Product updated successfully", product });
    } catch (err) {
        res.status(500).send({ message: "Error updating product", error: err.message });
    }
});


router.delete("/products/:id", verifyRetailer, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ 
            id: req.params.id, 
            retailer_id: req.user._id 
        });
        
        if (!product) return res.status(404).send({ message: "Product not found or not owned by retailer" });
        res.send({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).send({ message: "Error deleting product", error: err.message });
    }
});


router.get("/inventory", verifyRetailer, async (req, res) => {
    try {
        const retailer = await User.findById(req.user._id);
        if (!retailer) return res.status(404).send({ message: "Retailer not found" });

        // Determine category from email
        const domain = retailer.email.split('@')[0].toLowerCase();
        let category;
        if (domain.includes('women')) category = 'women';
        else if (domain.includes('men')) category = 'men';
        else if (domain.includes('kids') || domain.includes('kid')) category = 'kid';
        else return res.status(400).send({ message: "Invalid retailer email format" });

        const products = await Product.find({ 
            category: category,
            retailer_id: req.user._id 
        });
        res.send(products);
    } catch (err) {
        res.status(500).send({ message: "Error fetching inventory", error: err.message });
    }
});


router.put("/inventory/:id/retailer-stock", verifyRetailer, async (req, res) => {
    try {
        const { stock } = req.body;
        if (typeof stock !== 'number') {
            return res.status(400).send({ message: "Stock must be a number" });
        }

        const product = await Product.findOneAndUpdate(
            { id: req.params.id, retailer_id: req.user._id },
            { retailer_stock: stock },
            { new: true }
        );
        
        if (!product) return res.status(404).send({ message: "Product not found or not owned by retailer" });
        res.send({ message: "Retailer stock updated successfully", product });
    } catch (err) {
        res.status(500).send({ message: "Error updating retailer stock", error: err.message });
    }
});


router.put("/inventory/:id/shopper-stock", verifyRetailer, async (req, res) => {
    try {
        const { stock } = req.body;
        if (typeof stock !== 'number') {
            return res.status(400).send({ message: "Stock must be a number" });
        }

        
        const product = await Product.findOne({ 
            id: req.params.id, 
            retailer_id: req.user._id 
        });
        
        if (!product) return res.status(404).send({ message: "Product not found or not owned by retailer" });
        if (stock > product.retailer_stock) {
            return res.status(400).send({ message: "Not enough retailer stock available" });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { id: req.params.id, retailer_id: req.user._id },
            { shopper_stock: stock },
            { new: true }
        );
        
        res.send({ message: "Shopper stock updated successfully", product: updatedProduct });
    } catch (err) {
        res.status(500).send({ message: "Error updating shopper stock", error: err.message });
    }
});


router.get("/shopper-inventory", verifyRetailer, async (req, res) => {
    try {
        const retailer = await User.findById(req.user._id);
        if (!retailer) return res.status(404).send({ message: "Retailer not found" });

        // Determine category from email
        const domain = retailer.email.split('@')[0].toLowerCase();
        let category;
        if (domain.includes('women')) category = 'women';
        else if (domain.includes('men')) category = 'men';
        else if (domain.includes('kids') || domain.includes('kid')) category = 'kid';
        else return res.status(400).send({ message: "Invalid retailer email format" });

        const products = await Product.find({ 
            category: category,
            retailer_id: req.user._id,
            shopper_stock: { $gt: 0 } // Only products with shopper stock > 0
        });
        res.send(products);
    } catch (err) {
        res.status(500).send({ message: "Error fetching shopper inventory", error: err.message });
    }
});




router.get("/products/:id/stock", verifyRetailer, async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        
        res.send({
            shopper_stock: product.shopper_stock,
            retailer_stock: product.retailer_stock
        });
    } catch (err) {
        res.status(500).send({ 
            message: "Failed to fetch product stock", 
            error: err.message 
        });
    }
});


router.get("/products/:id/shopper-stock", async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.send({
            shopper_stock: product.shopper_stock
        });
    } catch (err) {
        res.status(500).send({ 
            message: "Failed to fetch product stock", 
            error: err.message 
        });
    }
});


router.put("/products/:id/reduce-stock", async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).send({ message: "Invalid quantity" });
        }

        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        if (product.shopper_stock < quantity) {
            return res.status(400).send({ message: "Not enough stock available" });
        }

       
        product.shopper_stock -= quantity;
        await product.save();

        res.send({ 
            message: "Stock reduced successfully",
            updatedStock: product.shopper_stock
        });
    } catch (err) {
        res.status(500).send({ 
            message: "Failed to reduce stock", 
            error: err.message 
        });
    }
});

module.exports = router;