const mongoose = require("mongoose");
const { config } = require("./development");
const dbgr = require("debug")("development:chessGame/db");

const connectDB = async () => {
    try {
        await mongoose.connect(`${config.MONGO_URI || config.MONGODB_URI}`, {
            // await mongoose.connect(`${process.env.MONGODB_URI}`, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        })
            .then(() => {
                dbgr('MongoDB connected');
                console.log('MongoDB connected', config.MONGO_URI || config.MONGODB_URI);
            })
            .catch((err) => {
                dbgr('MongoDB connection error', err.message);
                console.error('MongoDB connection error: ', err.message);
            });
    } catch (err) {
        console.error('Connection error', err.message);
    }
};

connectDB();

mongoose.connection
    .on('connected', () => {   //when mongoose connected
        dbgr('Mongoose connected to db')
    })
    .on('error', (err) => {    //on mongoose connection error
        dbgr(err.message)
    })
    .on('disconnected', () => {    //on mongoose disconnection
        dbgr('Mongoose connection is disconnected')
    });

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0)
});