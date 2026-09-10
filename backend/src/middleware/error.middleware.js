const errorHandler = (err, req, res, next) => {
    if (err?.name === "VersionError") {
        return res.status(409).json({
            success: false,
            message: "Ride was modified by another request. Please refresh and retry.",
        });
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

export default errorHandler;