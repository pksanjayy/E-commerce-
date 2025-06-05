const router = require("express").Router();
const { User,validate} = require("../models/user");
const bcrypt = require("bcrypt");
const verifyUser = require('../middleware/verifyUser');
const Cart = require('../models/cart');
const Order = require('../models/order');
const AllOrder = require('../models/allOrders');
const Product = require('../models/products');

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        if (req.body.role === "admin")
            return res.status(403).send({ message: "Admin signup not allowed" });
        


        const userExists = await User.findOne({ email: req.body.email });
        if (userExists)
            return res.status(409).send({ message: "User with given email already exists" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const status = req.body.role === "retailer" ? "pending" : "approved";

        await new User({
            ...req.body,
            password: hashedPassword,
            status: status
        }).save();

        if (req.body.role === "retailer") {
            return res.status(201).send({ message: "Retailer account request sent to admin." });
        }


        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.get('/cart', verifyUser, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  res.send(cart || { user: req.user._id, items: [] });
});


router.post('/cart', verifyUser, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.send({ message: "Cart updated", cart });
});


router.post('/orders', verifyUser, async (req, res) => {
    try {
        const { items, total } = req.body;

        // 1. First validate stock for all items
        for (const item of items) {
            const product = await Product.findOne({ id: item.productId });
            if (!product) {
                return res.status(404).send({ message: `Product ${item.productId} not found` });
            }
            if (product.shopper_stock < item.quantity) {
                return res.status(400).send({ 
                    message: `Not enough stock for product ${product.name}. Available: ${product.shopper_stock}`
                });
            }
        }

        
        for (const item of items) {
            await Product.findOneAndUpdate(
                { id: item.productId },
                { $inc: { shopper_stock: -item.quantity } }
            );
        }

       
        const newOrder = new Order({
            user: req.user._id,
            items,
            total,
            status: "Processing"
        });

        const globalOrder = new AllOrder({
            user: req.user._id,
            items,
            total,
            status: "Processing"
        });

        await newOrder.save();
        await globalOrder.save();

        
        await Cart.deleteOne({ user: req.user._id });

        res.status(201).send({ 
            message: "Order placed successfully", 
            order: newOrder 
        });

    } catch (error) {
        console.error("Order placement error:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});



router.get('/orders', verifyUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ orderedAt: -1 })
      .lean(); // makes orders plain JS objects for modification

    for (const order of orders) {
      for (const item of order.items) {
        const product = await Product.findOne({ id: Number(item.productId) });
        if (product) {
          item.product = {
            name: product.name,
            image: product.image,
            price: product.new_price,
          };
        }else {
            console.warn(`⚠️ Product not found for productId: ${item.productId}`);
        }
      }
    }

    res.send(orders);
  } catch (error) {
    console.error("Error fetching orders with product details:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

router.get('/products/:id/stock', verifyUser, async (req, res) => {
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


module.exports = router;