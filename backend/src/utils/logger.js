const SENSITIVE_KEYS = new Set([
    "authorization",
    "cookie",
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "clientSecret",
    "secret",
]);

const sanitize = (value, seen = new WeakSet()) => {
    if (value == null) return value;
    if (typeof value !== "object") return value;

    if (seen.has(value)) return "[Circular]";
    seen.add(value);

    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack,
        };
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitize(item, seen));
    }

    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => !SENSITIVE_KEYS.has(key))
            .map(([key, entry]) => [key, sanitize(entry, seen)])
    );
};

const write = (level, message, context = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...sanitize(context),
    };

    const output = JSON.stringify(entry);

    if (level === "error") {
        console.error(output);
    } else if (level === "warn") {
        console.warn(output);
    } else {
        console.log(output);
    }
};

const logger = {
    info(message, context) {
        write("info", message, context);
    },
    warn(message, context) {
        write("warn", message, context);
    },
    error(message, context) {
        write("error", message, context);
    },
};

export default logger;
