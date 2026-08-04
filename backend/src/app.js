import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Cab Dispatch API Running",
  });
});

app.use("/api/auth", authRoutes);

export default app;