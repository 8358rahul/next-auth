import mongoose from "mongoose";

export async function dbConnect() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable is not set");
        }

        console.log("Connecting to MongoDB with URI:", mongoUri);

        await mongoose.connect(mongoUri);

        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log("MongoDB connected");
        });

        connection.on('error', (err) => {
            console.error("MongoDB connection error: " + err);
            process.exit(1);
        });
    } catch (error) {
        console.error("Something went wrong in connecting to DB");
        console.error(error);
    }
}
