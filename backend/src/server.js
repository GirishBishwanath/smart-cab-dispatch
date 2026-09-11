import http from "http";
import app from "./app.js";

import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import { initializeSocket } from "./config/socket.js";
import logger from "./utils/logger.js";

const startServer = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);

        initializeSocket(server);

        server.listen(PORT, () => {
            logger.info("server.started", {
                port: PORT,
                nodeEnv: process.env.NODE_ENV || "development",
            });
            logger.info("socketio.initialized", { port: PORT });
        });
    } catch (error) {
        logger.error("server.start.failed", {
            errorMessage: error?.message,
            stack: error?.stack,
        });
        process.exit(1);
    }
};

startServer();
