import http from "node:http";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import { initializeSocket, closeSocket } from "./config/socket.js";
import { setReadiness } from "./routes/health.routes.js";
import logger from "./utils/logger.js";

const server = http.createServer(app);
let shuttingDown = false;

const startServer = async () => {
    try {
        await connectDB();
        initializeSocket(server);

        server.listen(PORT, () => {
            setReadiness(true);
            logger.info("server.started", {
                port: PORT,
                nodeEnv: process.env.NODE_ENV || "development",
            });
            logger.info("socketio.initialized", { port: PORT });
        });
    } catch (error) {
        setReadiness(false);
        logger.error("server.start.failed", {
            errorMessage: error?.message,
            stack: error?.stack,
        });
        process.exit(1);
    }
};

const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    setReadiness(false);
    logger.info("server.shutdown.started", { signal });

    closeSocket();
    server.close(async (error) => {
        if (error) {
            logger.error("server.shutdown.http.failed", {
                signal,
                errorMessage: error?.message,
                stack: error?.stack,
            });
            process.exitCode = 1;
        }

        try {
            await mongoose.connection.close();
            logger.info("server.shutdown.completed", { signal });
        } catch (shutdownError) {
            logger.error("server.shutdown.failed", {
                signal,
                errorMessage: shutdownError?.message,
                stack: shutdownError?.stack,
            });
            process.exitCode = 1;
        }
    });
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

startServer();
