const mongoose = require("mongoose");

module.exports = async () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    try {
        await mongoose.connect(process.env.MONGO_URL, connectionParams); 
        console.log("connected to database successfully");
    } catch (error) {
        console.error("Could not connect to database:", error);
    }
};
