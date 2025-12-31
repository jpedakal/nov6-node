const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        const URL = process.env.MONGO_DB_URL;
        const options = {
            useNewUrlParser: true, // Use the new URL string parser
            useUnifiedTopology: true, // Use the new Server Discover and Monitoring engine
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            maxPoolSize: 50,
            minPoolSize: 10,
            retryWrites: true, // Enable retryable writes
        };
        console.log('URL', URL);
        await mongoose.connect(URL, options);
        console.log('MongoDB Connected Successfully!');
    } catch (err) {
        console.log('Failed to connect Database');
    }
};

module.exports = dbConnection;
