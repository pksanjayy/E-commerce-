const router = require("express").Router();
const { User } = require("../models/user");
const AllOrder = require("../models/allOrders"); 
const jwt = require("jsonwebtoken");


function verifyAdmin(req, res, next) {
    let token = req.header("authorization");
    if (!token) return res.status(401).send({ message: "Access Denied" });

    if (token.startsWith("Bearer ")) {
        token = token.slice(7, token.length).trim();
    }

    try {
        const verified = jwt.verify(token, process.env.JWTPRIVATEKEY);
        console.log("verified", verified);

        if (verified.role !== "admin")
            return res.status(403).send({ message: "Admin access only" });

        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send({ message: "Invalid Token", err: err.message });
    }
}



router.get("/pending-retailers", verifyAdmin, async (req, res) => {
    const pending = await User.find({ role: "retailer", status: "pending" });
    res.send(pending);
});


router.post("/approve-retailer", verifyAdmin, async (req, res) => {
    const { retailerId } = req.body;
    const retailer = await User.findById(retailerId);
    if (!retailer || retailer.role !== "retailer")
        return res.status(404).send({ message: "Retailer not found" });

    retailer.status = "approved";
    await retailer.save();
    res.send({ message: "Retailer approved successfully" });
});


router.get("/retailers", verifyAdmin, async (req, res) => {
  try {
    const approvedRetailers = await User.find({ role: "retailer", status: "approved" });
    res.send(approvedRetailers);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch retailers", error: err.message });
  }
});

router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const approvedUsers = await User.find({ role: "user", status: "approved" });
    res.send(approvedUsers);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch users", error: err.message });
  }
});

router.get("/orders", verifyAdmin, async (req, res) => {
    try {
        const { status, limit, skip } = req.query;
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const orders = await AllOrder.find(query)
            .populate('user', 'name email') 
            .limit(parseInt(limit) || 0)
            .skip(parseInt(skip) || 0)
            .sort({ orderedAt: -1 });

        
        const formattedOrders = orders.map(order => ({
            id: order._id,
            customer: order.user?.name || "Unknown", 
            customerEmail: order.user?.email || "", 
            date: order.orderedAt.toISOString().split('T')[0],
            total: order.total,
            status: order.status,
            items: order.items 
        }));

        res.send(formattedOrders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send({ 
            message: "Failed to fetch orders", 
            error: err.message 
        });
    }
});


router.get('/analytics', verifyAdmin, async (req, res) => {
  console.log("📊 /admin/analytics endpoint hit");

  try {
    // 
    const totalSalesResult = await AllOrder.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;
    console.log("💰 Total Sales:", totalSales);

    
    const categorySales = await AllOrder.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                {
                  case: { $lte: ['$items.productId', 12] },
                  then: 'womens'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$items.productId', 13] },
                      { $lte: ['$items.productId', 24] }
                    ]
                  },
                  then: 'mens'
                },
                {
                  case: { $gte: ['$items.productId', 25] },
                  then: 'kids'
                }
              ],
              default: 'other'
            }
          },
          total: {
            $sum: {
              $multiply: ['$items.price', '$items.quantity']
            }
          }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          _id: 0
        }
      }
    ]);


    console.log("📂 Raw category sales:", categorySales);

    const salesByCategory = {
      mens: 0,
      womens: 0,
      kids: 0,
      other: 0
    };

    categorySales.forEach(item => {
      const key = item.category;
      if (salesByCategory.hasOwnProperty(key)) {
        salesByCategory[key] = item.total;
      } else {
        salesByCategory.other += item.total;
      }
    });

    console.log("🧾 Formatted category totals:", salesByCategory);


    const response = {
      success: true,
      totalSales,
      salesByCategory
    };

    console.log("✅ Sending analytics response:", response);
    res.json(response);

  } catch (err) {
    console.error("❌ Error in /admin/analytics:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: err.message
    });
  }
});

module.exports = router;
