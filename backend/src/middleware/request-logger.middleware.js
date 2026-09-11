import { randomUUID } from "node:crypto";

import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
    const requestId = randomUUID();
    const startedAt = process.hrtime.bigint();

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

        logger.info("http.request.completed", {
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2)),
        });
    });

    next();
};

export default requestLogger;
