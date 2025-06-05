require('dotenv').config();
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const connectDB = require("../db");

const createAdmin = async () => {
	await connectDB();

	const existingAdmin = await User.findOne({ email: "admin@example.com" });
	if (existingAdmin) {
		console.log("Admin already exists");
		return;
	}

	const password = await bcrypt.hash("Admin@123", Number(process.env.SALT));
	const admin = new User({
		firstName: "Admin",
		lastName: "User",
		email: "admin@example.com",
		password,
		role: "admin",
		status: "approved"
	});

	await admin.save();
	console.log("✅ Admin user created successfully");
	process.exit();
};

createAdmin().catch(err => {
	console.error("❌ Error creating admin:", err);
	process.exit(1);
});
