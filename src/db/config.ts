import mongoose from "mongoose";

export default async function connection() {
    try {
        await mongoose.connect("mongodb://localhost:27017/arjun", {
            serverSelectionTimeoutMS: 5000,  // Set a timeout for server selection
            socketTimeoutMS: 45000  // Set socket timeout
        });
        console.log('MongoDB connection successful');
    } catch (err) {
        console.log('MongoDB connection error:', err);
    }
}
