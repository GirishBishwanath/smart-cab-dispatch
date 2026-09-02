import http from "http";
import app from "./app.js";

import connectDB from "./config/db.js";
import { PORT } from "./config/env.js";
import { initializeSocket } from "./config/socket.js";

const startServer = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);

        initializeSocket(server);

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔌 Socket.IO ready on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();