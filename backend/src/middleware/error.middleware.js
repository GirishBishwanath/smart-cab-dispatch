import logger from "../utils/logger.js";

const getMongoErrorResponse = (err) => {
    if (err?.name === "ValidationError") {
        const message = Object.values(err.errors ?? {})
            .map((item) => item.message)
            .filter(Boolean)
            .join(". ");

        return {
            statusCode: 400,
            message: message || "Invalid request data.",
        };
    }

    if (err?.name === "CastError") {
        return {
            statusCode: 400,
            message: "Invalid resource identifier.",
        };
    }

    if (err?.code === 11000) {
        const fields = Object.keys(err.keyPattern ?? err.keyValue ?? {});

        return {
            statusCode: 409,
            message: fields.length
                ? `A record with the same ${fields.join(", ")} already exists.`
                : "A conflicting record already exists.",
        };
    }

    return null;
};

const errorHandler = (err, req, res, next) => {
    const mongoError = getMongoErrorResponse(err);
    const statusCode =
        mongoError?.statusCode ??
        err?.statusCode ??
        500;
    const isServerError = statusCode >= 500;
    const message =
        mongoError?.message ??
        err?.message ??
        "Request failed";

    logger.error("http.request.failed", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
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
            : message,
        stack:
            process.env.NODE_ENV === "development"
                ? err?.stack
                : undefined,
    });
};

export default errorHandler;
