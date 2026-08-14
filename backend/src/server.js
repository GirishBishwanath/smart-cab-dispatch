import http from "http";

import app from "./app.js";

import connectDB from "./config/db.js";

import { PORT } from "./config/env.js";

import {
    setupSocket,
} from "./sockets/socket.js";

const startServer = async () => {
    try {
        /*
         * Connect to MongoDB first.
         */
        await connectDB();

        /*
         * Create the HTTP server.
         *
         * Socket.IO attaches to this same server.
         */
        const server =
            http.createServer(app);

        /*
         * Initialize Socket.IO.
         *
         * This MUST happen before server.listen().
         */
        setupSocket(server);

        /*
         * Start HTTP + Socket.IO server.
         */
        server.listen(
            PORT,
            () => {
                console.log(
                    `🚀 Server running on port ${PORT}`
                );

                console.log(
                    `🔌 Socket.IO ready on port ${PORT}`
                );
            }
        );
    } catch (error) {
        console.error(
            "❌ Failed to start server:",
            error
        );

        process.exit(1);
    }
};

startServer();