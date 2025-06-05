require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const connection = require("./db");
const path = require('path');
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const retailerRoutes = require("./routes/retailer"); 

connection();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/retailer", retailerRoutes); 
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));