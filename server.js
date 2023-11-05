const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Catch Uncaugth Exception Errors
process.on('uncaughtException', (err) => {
    console.log('Unhandled Exception! Shutting down...');
    console.log(`${err.name}. ${err.message}`);
    process.exit(1);
});

dotenv.config({path: './config.env'});

const app = require('./app');
const { Mongoose } = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => console.log('Db conenction successful'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`App running on port: ${PORT}`);
});

// Catch Unhandled Rejection Errors
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection! Shutting down...');
    console.log(`${err.name}. ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});