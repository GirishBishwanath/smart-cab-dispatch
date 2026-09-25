import http from "node:http";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";
import { DEMO_DATA_ENABLED, PORT } from "./config/env.js";
import ensureDatabaseIndexes from "./config/indexes.js";
import { initializeSocket, closeSocket } from "./config/socket.js";
import { setReadiness } from "./routes/health.routes.js";
import { seedDatabase } from "./scripts/seed.js";
import logger from "./utils/logger.js";

const server = http.createServer(app);
let shuttingDown = false;

const startServer = async () => {
    try {
        await connectDB();
        await ensureDatabaseIndexes();

        if (DEMO_DATA_ENABLED) {
            logger.info("demo_data.bootstrap.started");
            await seedDatabase();
            logger.info("demo_data.bootstrap.completed");
        }

        initializeSocket(server);

        server.listen(PORT, () => {
            setReadiness(true);
            logger.info("server.started", {
                port: PORT,
                nodeEnv: process.env.NODE_ENV || "development",
                demoDataEnabled: DEMO_DATA_ENABLED,
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

const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    setReadiness(false);
    logger.info("server.shutdown.started", { signal });

    try {
        await closeSocket();
        await mongoose.connection.close();
        logger.info("server.shutdown.completed", { signal });
    } catch (error) {
        logger.error("server.shutdown.failed", {
            signal,
            errorMessage: error?.message,
            stack: error?.stack,
        });
        process.exitCode = 1;
    }
};

process.once("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
        logger.error("server.shutdown.unhandled", {
            errorMessage: error?.message,
            stack: error?.stack,
        });
        process.exitCode = 1;
    });
});

process.once("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
        logger.error("server.shutdown.unhandled", {
            errorMessage: error?.message,
            stack: error?.stack,
        });
        process.exitCode = 1;
    });
});

startServer();
