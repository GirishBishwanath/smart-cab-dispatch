import http from "http";

import app from "./app.js";

import connectDB from "./config/db.js";

import { PORT } from "./config/env.js";

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();