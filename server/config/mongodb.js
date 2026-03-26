import mongoose from 'mongoose'
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection;
        console.log("MongoDB Connected to DB:", db.name);
    } catch (err) {
        console.error("DB Connection Failed", err.message);
    }
};

export default connectDB;