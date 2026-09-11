import mongoose from "mongoose";
import dns from "dns";
import { MONGO_URI } from "./env.js";
import logger from "../utils/logger.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);

        logger.info("mongodb.connected", {
            host: conn.connection.host,
        });
    } catch (error) {
        logger.error("mongodb.connection.failed", {
            errorMessage: error?.message,
            stack: error?.stack,
        });
        throw error;
    }
};

export default connectDB;
