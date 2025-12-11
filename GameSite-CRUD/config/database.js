// imports ===========================================================================================

const mongoose = require('mongoose');

// connecting to DB ==================================================================================

try{
    mongoose.connect(process.env.MONGODB_URI);
    mongoose.connection.on("connected", () => console.log(`Connected to MongoDB: ${mongoose.connection.name}`))
}
catch(err){
    console.log('Ran into an error: ' + err)
}