const mongoose = require('mongoose');
require('dotenv').config()

const databaseConnect = async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("The database connected successfully")
    } catch (error) {
        console.error("Database Connection Failed", error.message);
    }
}

module.exports = databaseConnect;
