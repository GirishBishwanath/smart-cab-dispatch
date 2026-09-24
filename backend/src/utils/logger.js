const normalizeKey = (key) =>
    key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

const SENSITIVE_KEYS = new Set([
    "authorization",
    "cookie",
    "password",
    "token",
    "access_token",
    "access-token",
    "refresh_token",
    "refresh-token",
    "client_secret",
    "client-secret",
    "secret",
]);

const sanitize = (value, ancestors = new Set()) => {
    if (value == null) return value;
    if (typeof value !== "object") return value;

    if (ancestors.has(value)) return "[Circular]";

    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack,
        };
    }

    const nextAncestors = new Set(ancestors);
    nextAncestors.add(value);

    if (Array.isArray(value)) {
        return value.map((item) => sanitize(item, nextAncestors));
    }

    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => !SENSITIVE_KEYS.has(normalizeKey(key)))
            .map(([key, entry]) => [key, sanitize(entry, nextAncestors)])
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
