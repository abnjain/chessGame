const mongoose = require("mongoose");
const config = require("./development.json");
const dbgr = require("debug")("development:chessGame/db");

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        dbgr('MongoDB connected');
    } catch (err) {
        console.error('Connection error', err.message);
    }
};

connectDB();

mongoose.connection
.on('connected', ()=>{   //when mongoose connected
    dbgr('Mongoose connected to db')
})
.on('error', (err)=>{    //on mongoose connection error
    dbgr(err.message)
})
.on('disconnected', ()=>{    //on mongoose disconnection
    dbgr('Mongoose connection is disconnected')
});

process.on('SIGINT', async()=>{
    await mongoose.connection.close();
    process.exit(0)
});