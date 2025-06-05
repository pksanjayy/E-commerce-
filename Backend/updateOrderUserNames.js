require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/user');    // adjust path if needed
const  Order  = require('./models/allOrders');  // adjust path if needed

async function updateAllOrdersWithUserNames() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Get all unique user ObjectIds from orders
    const userIds = await Order.distinct('user');
    console.log(`Found ${userIds.length} unique users in orders.`);

    for (const userIdRaw of userIds) {
      // Make sure to create ObjectId instance properly with 'new'
      const userId = new mongoose.Types.ObjectId(userIdRaw);

      // Find the user
      const user = await User.findById(userId).select('firstName lastName');
      if (!user) {
        console.log(`User not found for ID: ${userId}`);
        continue;
      }

      const fullName = `${user.firstName} ${user.lastName}`;

      // Update all orders for this user
      const result = await Order.updateMany(
        { user: userId },
        { $set: { userName: fullName } }
      );

      const updatedCount = result.nModified ?? result.modifiedCount ?? 0;
      console.log(`Updated ${updatedCount} orders for user ${fullName} (${userId})`);
      console.log(result);

    }
    const result = await Order.updateMany(
  { user: userId },
  { $set: { userName: fullName } }
);

   


  } catch (err) {
    console.error("❌ Error updating orders:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateAllOrdersWithUserNames();
