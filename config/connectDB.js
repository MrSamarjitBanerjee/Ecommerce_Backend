// Connecting to Mongo Database
const mongoose = require('mongoose');
require('dotenv').config()

if(!process.env.MONGODB_URI){
    throw new Error("Provide MONGODB Connection String in .env File")
}

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("DB Connected")

    }
    catch(e){
        console.log("Connection Error" , e)
        process.exit(1)
    }
}

module.exports = connectDB