import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err?.statusCode || 500;
    const isServerError = statusCode >= 500;

    logger.error("http.request.failed", {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode,
        errorName: err?.name,
        errorMessage: err?.message,
        stack: isServerError ? err?.stack : undefined,
    });

    if (err?.name === "VersionError") {
        return res.status(409).json({
            success: false,
            message: "Ride was modified by another request. Please refresh and retry.",
        });
    }

    return res.status(statusCode).json({
        success: false,
        message: isServerError
            ? "Internal Server Error"
            : err?.message || "Request failed",
        stack:
            process.env.NODE_ENV === "development"
                ? err?.stack
                : undefined,
    });
};

export default errorHandler;
